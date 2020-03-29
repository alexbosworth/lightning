const {createHash} = require('crypto');
const EventEmitter = require('events');

const {chanFormat} = require('bolt07');

const {isLnd} = require('./../../lnd_requests');
const {safeTokens} = require('./../../bolt00');
const {states} = require('./payment_states');

const hexToBuf = hex => Buffer.from(hex, 'hex');
const isHash = n => /^[0-9A-F]{64}$/i.test(n);
const mtokensPerToken = BigInt(1e3);
const sha256 = preimage => createHash('sha256').update(preimage).digest();

/** Subscribe to the status of a past payment

  Requires LND built with `routerrpc` build tag

  {
    id: <Payment Request Hash Hex String>
    lnd: <Authenticated LND gRPC API Object>
  }

  @throws
  <Error>

  @returns
  <Subscription EventEmitter Object>

  @event 'confirmed'
  {
    fee: <Total Fees Paid Rounded Down Number>
    fee_mtokens: <Total Fee Millitokens Paid String>
    hops: [{
      channel: <Standard Format Channel Id String>
      channel_capacity: <Channel Capacity Tokens Number>
      fee: <Routing Fee Tokens Number>
      fee_mtokens: <Fee Millitokens String>
      forward: <Forwarded Tokens Number>
      forward_mtokens: <Forward Millitokens String>
      public_key: <Public Key Hex String>
      timeout: <Timeout Block Height Number>
    }]
    id: <Payment Hash Hex String>
    mtokens: <Total Millitokens Paid String>
    safe_fee: <Payment Forwarding Fee Rounded Up Tokens Number>
    safe_tokens: <Payment Tokens Rounded Up Number>
    secret: <Payment Preimage Hex String>
    tokens: <Tokens Paid Number>
    timeout: <Expiration Block Height Number>
  }

  @event 'failed'
  {
    is_invalid_payment: <Failed Due to Payment Rejected At Destination Bool>
    is_pathfinding_timeout: <Failed Due to Pathfinding Timeout Bool>
    is_route_not_found: <Failed Due to Absence of Path Through Graph Bool>
  }

  @event 'paying'
  {}
*/
module.exports = args => {
  if (!isHash(args.id)) {
    throw new Error('ExpectedIdOfPastPaymentToSubscribeTo');
  }

  if (!isLnd({lnd: args.lnd, method: 'trackPayment', type: 'router'})) {
    throw new Error('ExpectedAuthenticatedLndToSubscribeToPastPaymentStatus');
  }

  const emitter = new EventEmitter();
  const sub = args.lnd.router.trackPayment({payment_hash: hexToBuf(args.id)});

  sub.on('data', data => {
    switch (data.state) {
    case states.confirmed:
      return emitter.emit('confirmed', {
        fee: safeTokens({mtokens: data.route.total_fees_msat}).tokens,
        fee_mtokens: data.route.total_fees_msat,
        hops: data.route.hops.map(hop => ({
          channel: chanFormat({number: hop.chan_id}).channel,
          channel_capacity: Number(hop.chan_capacity),
          fee: safeTokens({mtokens: hop.fee_msat}).tokens,
          fee_mtokens: hop.fee_msat,
          forward: safeTokens({mtokens: hop.amt_to_forward_msat}).tokens,
          forward_mtokens: hop.amt_to_forward_msat,
          public_key: hop.pub_key,
          timeout: hop.expiry,
        })),
        id: sha256(data.preimage).toString('hex'),
        mtokens: data.route.total_amt_msat,
        safe_fee: safeTokens({mtokens: data.route.total_fees_msat}).safe,
        safe_tokens: safeTokens({mtokens: data.route.total_amt_msat}).safe,
        secret: data.preimage.toString('hex'),
        tokens: safeTokens({mtokens: data.route.total_amt_msat}).tokens,
      });

    case states.errored:
    case states.invalid_payment:
    case states.pathfinding_routes_failed:
    case states.pathfinding_timeout_failed:
      return emitter.emit('failed', ({
        is_invalid_payment: data.state === states.invalid_payment,
        is_pathfinding_timeout: data.state === states.pathfinding_timeout,
        is_route_not_found: data.state === states.pathfinding_routes_failed,
      }));

    case states.paying:
      return emitter.emit('paying', {});

    default:
      return;
    }
  });

  sub.on('end', () => emitter.emit('end'));
  sub.on('error', err => emitter.emit('error', err));
  sub.on('status', n => emitter.emit('status', n));

  return emitter;
};
