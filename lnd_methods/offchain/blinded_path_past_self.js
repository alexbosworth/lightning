const {ECDH} = require('crypto');

const asyncAuto = require('async/auto');
const asyncWhilst = require('async/whilst');
const {decryptBlindedPath} = require('bolt04');

const {diffieHellmanComputeSecret} = require('./../signer');
const peerForChannel = require('./peer_for_channel');

const bufferAsNumber = n => BigInt(`0x${n.toString('hex') || '0'}`);
const byteLength = hex => hex.length / 2;
const ceilDivide = (a, b) => (a + b - BigInt(1)) / b;
const cltvDeltaByteLength = 2;
const curve = 'secp256k1';
const feeRateDenominator = BigInt(1e6);
const hexAsBuffer = hex => Buffer.from(hex, 'hex');
const introductionOf = n => n.introduction_node || n.hops[0].relay_key;
const maxRelayByteLength = 10;
const minRelayByteLength = 6;
const typePaymentRelay = '10';

/** Step past the hops of the node at the start of a blinded path

  When the node is the introduction node of a path, it reads its own hop like
  an introduction node would: the path then starts at the next node, with the
  next path key. This repeats while the path still starts at the node.

  The next node is the given next node, or the peer of the next channel.

  The path CLTV delta includes the hops of the node, so their CLTV deltas are
  taken out of it.

  The node does not pay itself the fees of its hops: the amount to send past
  the node is what its hops forward of the amount that arrives at the node,
  by their payment relay fees. The path fees are left as the whole path fees.

  There is no path when a hop of the node cannot be read or the next node is
  not found. A path of only hops of the node is a payment to the node itself.

  Requires `info:read`, `offchain:read`, `signer:generate` permissions when the
  path starts at the node

  {
    id: <Node Identity Public Key Hex String>
    lnd: <Authenticated LND API Object>
    mtokens: <Millitokens Arriving At The Path Introduction Node String>
    path: {
      base_fee_mtokens: <Accumulated Base Fee Millitokens String>
      cltv_delta: <Accumulated CLTV Expiry Delta Number>
      fee_rate: <Accumulated Fee Rate Millitokens Per Million Number>
      hops: [{
        encrypted_data: <Encrypted Recipient Data Hex String>
        relay_key: <Relaying Node Public Key Hex String>
      }]
      [introduction_node]: <Introduction Node Public Key Hex String>
      key: <First Hop Path Key Public Key Hex String>
      [max_htlc_mtokens]: <Maximum HTLC Millitokens String>
      [min_htlc_mtokens]: <Minimum HTLC Millitokens String>
    }
  }

  @returns via cbk
  {
    [mtokens]: <Millitokens To Send To The Path Introduction Node String>
    [path]: {
      base_fee_mtokens: <Accumulated Base Fee Millitokens String>
      cltv_delta: <Accumulated CLTV Expiry Delta Number>
      fee_rate: <Accumulated Fee Rate Millitokens Per Million Number>
      hops: [{
        encrypted_data: <Encrypted Recipient Data Hex String>
        relay_key: <Relaying Node Public Key Hex String>
      }]
      [introduction_node]: <Introduction Node Public Key Hex String>
      key: <First Hop Path Key Public Key Hex String>
      [max_htlc_mtokens]: <Maximum HTLC Millitokens String>
      [min_htlc_mtokens]: <Minimum HTLC Millitokens String>
    }
  }
*/
module.exports = ({id, lnd, mtokens, path}, cbk) => {
  const stepped = {mtokens, path};

  return asyncWhilst(
    cbk => cbk(null, !!stepped.path && introductionOf(stepped.path) === id),
    cbk => {
      const [hop, ...hops] = stepped.path.hops;
      const {key} = stepped.path;

      // A path that is only hops of the node is a payment to the node itself
      if (!hops.length) {
        return cbk([400, 'CannotPayToOwnNodeViaBlindedPath']);
      }

      return asyncAuto({
        // Get the shared secret of the path key and the node identity key
        getSecret: cbk => {
          // Exit early when the path key is not a point to share a secret with
          try {
            ECDH.convertKey(key, curve, 'hex', 'hex', 'compressed');
          } catch (err) {
            return cbk(null, {});
          }

          return diffieHellmanComputeSecret({
            lnd,
            partner_public_key: key,
          },
          cbk);
        },

        // Read the payment relay and the next hop out of the data of the hop
        readHop: ['getSecret', ({getSecret}, cbk) => {
          // Exit early when there is no secret to decrypt the hop data with
          if (!getSecret.secret) {
            return cbk(null, {});
          }

          const data = {};

          try {
            data.hop = decryptBlindedPath({
              key,
              encrypted: hop.encrypted_data,
              secret: getSecret.secret,
            });
          } catch (err) {
            // Exit early when the data of the hop cannot be decrypted
            return cbk(null, {});
          }

          const relay = data.hop.records.find(n => n.type === typePaymentRelay);

          const relayLength = !relay ? Number() : byteLength(relay.value);

          // Exit early when there is no payment relay data for the hop
          if (relayLength < minRelayByteLength) {
            return cbk(null, {});
          }

          // Exit early when the payment relay base fee is beyond a u32
          if (relayLength > maxRelayByteLength) {
            return cbk(null, {});
          }

          // Payment relay data is a CLTV delta, a fee rate and a base fee
          const relayData = hexAsBuffer(relay.value);

          const baseFeeData = relayData.subarray(minRelayByteLength);
          const cltvDelta = relayData.readUInt16BE();
          const feeRate = relayData.readUInt32BE(cltvDeltaByteLength);

          // The base fee is a truncated number, a zero base fee has no bytes
          const baseFee = bufferAsNumber(baseFeeData);

          // Exit early when the hop CLTV delta is beyond the path CLTV delta
          if (cltvDelta > stepped.path.cltv_delta) {
            return cbk(null, {});
          }

          const arriving = BigInt(stepped.mtokens);

          // Exit early when the arriving amount does not cover the base fee
          if (arriving < baseFee) {
            return cbk(null, {});
          }

          // A hop forwards what arrives less its fee on the forwarded amount
          const forward = ceilDivide(
            (arriving - baseFee) * feeRateDenominator,
            feeRateDenominator + BigInt(feeRate)
          );

          return cbk(null, {
            cltv_delta: cltvDelta,
            mtokens: forward.toString(),
            next_channel_id: data.hop.next_channel_id,
            next_node_id: data.hop.next_node_id,
            next_path_key: data.hop.next_path_key,
          });
        }],

        // Get the next node, which is given or is the peer of the next channel
        getNextNode: ['readHop', ({readHop}, cbk) => {
          // Exit early when the next node is given
          if (!!readHop.next_node_id) {
            return cbk(null, {public_key: readHop.next_node_id});
          }

          // Exit early when there is no next channel
          if (!readHop.next_channel_id) {
            return cbk(null, {});
          }

          return peerForChannel({
            id,
            lnd,
            channel: readHop.next_channel_id,
          },
          cbk);
        }],

        // Step past the hop so the path starts at the next node
        step: ['getNextNode', 'readHop', ({getNextNode, readHop}, cbk) => {
          // Exit early when there is no next node to start the path at
          if (!getNextNode.public_key) {
            return cbk(null, {});
          }

          return cbk(null, {
            mtokens: readHop.mtokens,
            path: {
              hops,
              base_fee_mtokens: stepped.path.base_fee_mtokens,
              cltv_delta: stepped.path.cltv_delta - readHop.cltv_delta,
              fee_rate: stepped.path.fee_rate,
              introduction_node: getNextNode.public_key,
              key: readHop.next_path_key,
              max_htlc_mtokens: stepped.path.max_htlc_mtokens,
              min_htlc_mtokens: stepped.path.min_htlc_mtokens,
            },
          });
        }],
      },
      (err, res) => {
        if (!!err) {
          return cbk(err);
        }

        stepped.mtokens = res.step.mtokens;
        stepped.path = res.step.path;

        return cbk();
      });
    },
    err => {
      if (!!err) {
        return cbk(err);
      }

      // Exit early when the path cannot be stepped past the node
      if (!stepped.path) {
        return cbk(null, {});
      }

      return cbk(null, {mtokens: stepped.mtokens, path: stepped.path});
    }
  );
};
