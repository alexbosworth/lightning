const {createHash} = require('crypto');

const {chanFormat} = require('bolt07');

const {attemptStates} = require('./constants');
const {safeTokens} = require('./../bolt00');

const {confirmed} = attemptStates;
const hexFromBuffer = buffer => buffer.toString('hex');
const {isArray} = Array;
const {isBuffer} = Buffer;
const {max} = Math;
const sha256 = preimage => createHash('sha256').update(preimage).digest();
const sum = arr => arr.reduce((sum, n) => sum + BigInt(n), BigInt(Number()));

/** Calculate total payment details from RPC payment HTLC elements

  {
    htlcs: [{
      attempt_time_ns: <Attempted At Epoch Nanoseconds String>
      resolve_time_ns: <HTLC Resolved At Epoch Nanoseconds String>
      route: [{
        hops: [{
          amt_to_forward_msat: <Forward Amount Millitokens String>
          chan_capacity: <Channel Capacity Tokens String>
          chan_id: <Numeric Format Channel Id String>
          custom_records: {
            <Record Type String>: <Record Value Buffer>
          }
          expiry: <Timeout Block Height Number>
          fee_msat: <Fee Amount Millitokens String>
          mpp_record: {
            total_amt_msat: <Total Amount Millitokens String>
            payment_addr: <Payment Address Buffer>
          }
          pub_key: <Forwarding To Public Key Hex String>
          tlv_payload: <Forward Has TLV Records Bool>
        }]
        total_amt_msat: <Route Total Sent Millitokens String>
        total_fees_msat: <Route Total Fee Millitokens String>
        total_time_lock: <Route Timeout Block Height Number>
      }]
      status: <Payment Status String>
    }]
    preimage: <Payment Preimage Buffer>
    [route]: {
      hops: [{
        amt_to_forward_msat: <Forward Amount Millitokens String>
        chan_capacity: <Channel Capacity Tokens String>
        chan_id: <Numeric Format Channel Id String>
        custom_records: {
          <Record Type String>: <Record Value Buffer>
        }
        expiry: <Timeout Block Height Number>
        fee_msat: <Fee Amount Millitokens String>
        mpp_record: {
          total_amt_msat: <Total Amount Millitokens String>
          payment_addr: <Payment Address Buffer>
        }
        pub_key: <Forwarding To Public Key Hex String>
        tlv_payload: <Forward Has TLV Records Bool>
      }]
      total_amt_msat: <Route Total Sent Millitokens String>
      total_fees_msat: <Route Total Fee Millitokens String>
      total_time_lock: <Route Timeout Block Height Number>
    }
  }

  @throws
  <Error>

  @returns
  {
    fee: <Total Fee Tokens Paid Rounded Down Number>
    fee_mtokens: <Total Fee Millitokens Paid String>
    hops: [{
      channel: <First Route Standard Format Channel Id String>
      channel_capacity: <First Route Channel Capacity Tokens Number>
      fee: <First Route Fee Tokens Rounded Down Number>
      fee_mtokens: <First Route Fee Millitokens String>
      forward: <First Route Forward Tokens Number>
      forward_mtokens: <First Route Forward Millitokens String>
      public_key: <First Route Public Key Hex String>
      timeout: <First Route Timeout Block Height Number>
    }]
    paths: [{
      fee: <Total Fee Tokens Paid Number>
      fee_mtokens: <Total Fee Millitokens Paid String>
      hops: [{
        channel: <Standard Format Channel Id String>
        channel_capacity: <Channel Capacity Tokens Number>
        fee: <Fee Tokens Rounded Down Number>
        fee_mtokens: <Fee Millitokens String>
        forward: <Forward Tokens Number>
        forward_mtokens: <Forward Millitokens String>
        public_key: <Public Key Hex String>
        timeout: <Timeout Block Height Number>
      }]
      mtokens: <Total Millitokens Paid String>
      safe_fee: <Total Fee Tokens Paid Rounded Up Number>
      safe_tokens: <Total Tokens Paid, Rounded Up Number>
      timeout: <Expiration Block Height Number>
    }]
    id: <Payment Hash Hex String>
    mtokens: <Total Millitokens Paid String>
    safe_fee: <Total Fee Tokens Paid Rounded Up Number>
    safe_tokens: <Total Tokens Paid, Rounded Up Number>
    secret: <Payment Preimage Hex String>
    timeout: <Expiration Block Height Number>
    tokens: <Total Tokens Paid Rounded Down Number>
  }
*/
module.exports = ({htlcs, preimage, route}) => {
  if (!isArray(htlcs)) {
    throw new Error('ExpectedArrayOfHtlcsToDeriveConfirmedFromPaymentStatus');
  }

  if (!isBuffer(preimage)) {
    throw new Error('ExpectedPreimageBufferToDeriveConfirmFromPaymentStatus');
  }

  if (!route && !htlcs.length) {
    throw new Error('ExpectedEitherRouteOrAttemptHtlcs');
  }

  if (!!htlcs.length && !htlcs.filter(n => n.status === confirmed).length) {
    throw new Error('ExpectedSuccessfulHtlcAttemptForConfirmedStatus');
  }

  const hasHtlcs = !!htlcs.length;
  const id = sha256(preimage).toString('hex');
  const secret = preimage.toString('hex');
  const successHtlcs = htlcs.filter(n => n.status === attemptStates.confirmed);

  const payments = hasHtlcs ? successHtlcs.map(({route}) => route) : [route];

  const paths = payments.map(route => ({
    fee: safeTokens({mtokens: route.total_fees_msat}).tokens,
    fee_mtokens: route.total_fees_msat,
    hops: route.hops.map(hop => ({
      channel: chanFormat({number: hop.chan_id}).channel,
      channel_capacity: Number(hop.chan_capacity),
      fee: safeTokens({mtokens: hop.fee_msat}).tokens,
      fee_mtokens: hop.fee_msat,
      forward: safeTokens({mtokens: hop.amt_to_forward_msat}).tokens,
      forward_mtokens: hop.amt_to_forward_msat,
      public_key: hexFromBuffer(hop.pub_key),
      timeout: hop.expiry,
    })),
    mtokens: route.total_amt_msat,
    safe_fee: safeTokens({mtokens: route.total_fees_msat}).safe,
    safe_tokens: safeTokens({mtokens: route.total_amt_msat}).safe,
    timeout: route.total_time_lock,
    tokens: safeTokens({mtokens: route.total_amt_msat}).tokens,
  }));

  const feeMtokens = sum(paths.map(n => n.fee_mtokens));
  const [{hops}] = paths;
  const mtokens = sum(paths.map(({mtokens}) => mtokens));

  return {
    hops,
    id,
    paths,
    secret,
    fee: safeTokens({mtokens: feeMtokens.toString()}).tokens,
    fee_mtokens: feeMtokens.toString(),
    mtokens: mtokens.toString(),
    safe_fee: safeTokens({mtokens: feeMtokens.toString()}).safe,
    safe_tokens: safeTokens({mtokens: mtokens.toString()}).safe,
    timeout: max(...paths.map(({timeout}) => timeout)),
    tokens: safeTokens({mtokens: mtokens.toString()}).tokens,
  };
};
