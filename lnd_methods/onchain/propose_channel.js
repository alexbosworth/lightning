const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {getPublicKey} = require('./../address');
const {isLnd} = require('./../../lnd_requests');

const family = 0;
const hexAsBuffer = hex => Buffer.from(hex, 'hex');
const maxCooperativeCloseDelay = 5e4;
const method = 'openChannel';
const type = 'default';

/** Propose a new channel to a peer that prepared for the channel proposal

  Channel proposals can allow for cooperative close delays or external funding
  flows.

  Requires `address:read`, `offchain:write`, `onchain:write` permissions

  Requires LND compiled with `walletrpc` build tag

  {
    capacity: <Channel Capacity Tokens Number>
    [cooperative_close_address]: <Restrict Cooperative Close To Address String>
    [cooperative_close_delay]: <Cooperative Close Relative Delay Number>
    [give_tokens]: <Tokens to Gift To Partner Number> // Defaults to zero
    id: <Pending Channel Id Hex String>
    [is_private]: <Channel is Private Bool> // Defaults to false
    key_index: <Channel Funding Output MultiSig Local Key Index Number>
    lnd: <Authenticated LND API Object>
    partner_public_key: <Public Key Hex String>
    remote_key: <Channel Funding Partner MultiSig Public Key Hex String>
    transaction_id: <Funding Output Transaction Id Hex String>
    transaction_vout: <Funding Output Transaction Output Index Number>
  }

  @returns via cbk or Promise
*/
module.exports = (args, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!args.capacity) {
          return cbk([400, 'ExpectedCapacityTokensToProposeChannelOpen']);
        }

        if (!args.id) {
          return cbk([400, 'ExpectedPendingChannelIdToProposeChannelOpen']);
        }

        if (args.key_index === undefined) {
          return cbk([400, 'ExpectedMultiSigKeyIndexToProposeChannelOpen']);
        }

        if (!isLnd({method, type, lnd: args.lnd})) {
          return cbk([400, 'ExpectedLndToProposeChannelOpen']);
        }

        if (!args.partner_public_key) {
          return cbk([400, 'ExpectedPartnerPublicKeyToProposeChannelOpen']);
        }

        if (!args.remote_key) {
          return cbk([400, 'ExpectedRemoteMultiSigKeyToProposeChannelOpen']);
        }

        if (!args.transaction_id) {
          return cbk([400, 'ExpectedFundingTransactionIdToProposeChanOpen']);
        }

        if (args.transaction_vout === undefined) {
          return cbk([400, 'ExpectedFundingTransactionVoutToProposeChanOpen']);
        }

        return cbk();
      },

      // Get the wallet key
      getKey: ['validate', ({}, cbk) => {
        return getPublicKey({
          family,
          lnd: args.lnd,
          index: args.key_index,
        },
        cbk);
      }],

      // Open the channel
      openChannel: ['getKey', ({getKey}, cbk) => {
        let isAnnounced = false;

        const channelOpen = args.lnd[type][method]({
          close_address: args.cooperative_close_address || undefined,
          funding_shim: {
            chan_point_shim: {
              amt: args.capacity.toString(),
              chan_point: {
                funding_txid_bytes: hexAsBuffer(args.transaction_id).reverse(),
                output_index: args.transaction_vout,
              },
              local_key: {
                raw_key_bytes: hexAsBuffer(getKey.public_key),
                key_loc: {key_index: args.key_index},
              },
              remote_key: hexAsBuffer(args.remote_key),
              pending_chan_id: hexAsBuffer(args.id),
              thaw_height: args.cooperative_close_delay || undefined,
            },
          },
          local_funding_amount: args.capacity.toString(),
          node_pubkey: hexAsBuffer(args.partner_public_key),
          private: !!args.is_private,
          push_sat: (args.give_tokens || Number()).toString(),
        });

        channelOpen.on('data', chan => {
          switch (chan.update) {
          case 'chan_open':
            break;

          case 'chan_pending':
            if (isAnnounced) {
              break;
            }

            isAnnounced = true;

            channelOpen.cancel();

            return cbk(null, {});
            break;

          case 'confirmation':
            break;

          default:
            break;
          }
        });

        channelOpen.on('end', () => {});

        channelOpen.on('error', err => {
          if (isAnnounced) {
            return;
          }

          isAnnounced = true;

          return cbk([503, 'UnexpectedErrorProposingChannelToPeer', {err}]);
        });

        return;
      }],
    },
    returnResult({reject, resolve, of: 'openChannel'}, cbk));
  });
};
