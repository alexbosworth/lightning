const EventEmitter = require('events');

const {channelAcceptAsOpenRequest} = require('./../../lnd_responses');
const {isLnd} = require('./../../lnd_requests');

const channelRequestEvent = 'channel_request';
const method = 'channelAcceptor';
const type = 'default';

/** Subscribe to inbound channel open requests

  Requires `offchain:write`, `onchain:write` permissions

  Note: listening to inbound channel requests will automatically fail all
  channel requests after a short delay.

  To return to default behavior of accepting all channel requests, remove all
  listeners to `channel_request`

  LND 0.11.1 and below do not support `accept` or `reject` arguments

  LND 0.15.0 and below do not support `is_trusted_funding`

  {
    lnd: <Authenticated LND API Object>
  }

  @throws
  <Error>

  @returns
  <EventEmitter Object>

  @event 'channel_request'
  {
    accept: <Accept Request Function> ({
      [cooperative_close_address]: <Restrict Coop Close To Address String>
      [is_trusted_funding]: <Accept Funding as Trusted Bool>
      [min_confirmations]: <Required Confirmations Before Channel Open Number>
      [remote_csv]: <Peer Unilateral Balance Output CSV Delay Number>
      [remote_reserve]: <Minimum Tokens Peer Must Keep On Their Side Number>
      [remote_max_htlcs]: <Maximum Slots For Attaching HTLCs Number>
      [remote_max_pending_mtokens]: <Maximum HTLCs Value Millitokens String>
      [remote_min_htlc_mtokens]: <Minimium HTLC Value Millitokens String>
    }) -> {}
    capacity: <Capacity Tokens Number>
    chain: <Chain Id Hex String>
    commit_fee_tokens_per_vbyte: <Commitment Transaction Fee Number>
    csv_delay: <CSV Delay Blocks Number>
    id: <Request Id Hex String>
    is_private: <Incoming Channel Is Private Bool>
    is_trusted_funding: <Request Immediate Trusted Funding Bool>
    local_balance: <Channel Local Tokens Balance Number>
    local_reserve: <Channel Local Reserve Tokens Number>
    max_pending_mtokens: <Maximum Millitokens Pending In Channel String>
    max_pending_payments: <Maximum Pending Payments Number>
    min_chain_output: <Minimum Chain Output Tokens Number>
    min_htlc_mtokens: <Minimum HTLC Millitokens String>
    partner_public_key: <Peer Public Key Hex String>
    reject: <Reject Request Function> ({
      [reason]: <500 Character Limited Rejection Reason String>
    }) -> {}
  }

  @event 'error'
  <Error Object>
*/
module.exports = ({lnd}) => {
  if (!isLnd({lnd, method, type})) {
    throw new Error('ExpectedLndToSubscribeToChannelRequests');
  }

  const emitter = new EventEmitter();
  const sub = lnd[type][method]({});

  const emitError = err => {
    // Exit early when no one is listening to the error
    if (!emitter.listenerCount('error')) {
      return;
    }

    return emitter.emit('error', err);
  };

  sub.on('data', data => {
    try {
      const request = channelAcceptAsOpenRequest(data);

      const id = data.pending_chan_id;

      return emitter.emit(channelRequestEvent, ({
        accept: (params) => {
          if (!params) {
            return sub.write({accept: true, pending_chan_id: id});
          }

          return sub.write({
            accept: true,
            csv_delay: params.remote_csv || undefined,
            in_flight_max_msat: params.remote_max_pending_mtokens || undefined,
            zero_conf: params.is_trusted_funding || undefined,
            max_htlc_count: params.remote_max_htlcs || undefined,
            min_accept_depth: params.min_confirmations || undefined,
            min_htlc_in: params.remote_min_htlc_mtokens || undefined,
            pending_chan_id: id,
            reserve_sat: params.remote_reserve || undefined,
            upfront_shutdown: params.cooperative_close_address || undefined,
          });
        },
        capacity: request.capacity,
        chain: request.chain,
        commit_fee_tokens_per_vbyte: request.commit_fee_tokens_per_vbyte,
        csv_delay: request.csv_delay,
        id: request.id,
        is_private: request.is_private,
        is_trusted_funding: request.is_trusted_funding,
        local_balance: request.local_balance,
        local_reserve: request.local_reserve,
        max_pending_mtokens: request.max_pending_mtokens,
        max_pending_payments: request.max_pending_payments,
        min_chain_output: request.min_chain_output,
        min_htlc_mtokens: request.min_htlc_mtokens,
        partner_public_key: request.partner_public_key,
        reject: (params) => {
          if (!params) {
            return sub.write({accept: false, pending_chan_id: id});
          }

          return sub.write({
            accept: false,
            error: params.reason || undefined,
            pending_chan_id: id,
          });
        },
      }));
    } catch (err) {
      return emitError([503, err.message]);
    }
  });

  sub.on('end', () => emitter.emit('end', {}));
  sub.on('error', emitError);

  emitter.on('removeListener', event => {
    // Exit early when there are still listeners to channel requests
    if (!!emitter.listenerCount(channelRequestEvent)) {
      return;
    }

    return sub.cancel();
  });

  return emitter;
};
