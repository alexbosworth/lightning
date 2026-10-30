const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');
const {throws} = require('node:assert').strict;

const {subscribeToOpenRequests} = require('./../../../');
const {subscriptionEvents} = require('./../macros');

const cancelled = {details: 'Cancelled on client'};
const channelRequest = 'channel_request';
const id = Buffer.alloc(32);
const listenerFailure = {event: 'error', data: [503, 'ListenerFailure']};
const rpcRequest = {
  chain_hash: Buffer.alloc(32),
  channel_flags: 34,
  channel_reserve: '1',
  commitment_type: 'LEGACY',
  csv_delay: 1,
  dust_limit: '1',
  fee_per_kw: '1000',
  funding_amt: '1',
  max_accepted_htlcs: 1,
  max_value_in_flight: '1000',
  min_htlc: '1000',
  node_pubkey: Buffer.alloc(33, 3),
  pending_chan_id: Buffer.alloc(32),
  push_amt: '1000',
};

// The channel request that is emitted for the RPC request
const request = {
  event: 'channel_request',
  data: {
    capacity: 1,
    chain: Buffer.alloc(32).toString('hex'),
    commit_fee_tokens_per_vbyte: 4,
    csv_delay: 1,
    id: Buffer.alloc(32).toString('hex'),
    is_private: true,
    is_trusted_funding: false,
    local_balance: 1,
    local_reserve: 1,
    max_pending_mtokens: '1000',
    max_pending_payments: 1,
    min_chain_output: 1,
    min_htlc_mtokens: '1000',
    partner_public_key: Buffer.alloc(33, 3).toString('hex'),
    type: 'original',
  },
};

// The writes made when a channel request is accepted and rejected
const writes = [
  {accept: true, pending_chan_id: id},
  {accept: false, pending_chan_id: id},
  {
    accept: true,
    csv_delay: undefined,
    in_flight_max_msat: undefined,
    max_htlc_count: undefined,
    min_accept_depth: undefined,
    min_htlc_in: undefined,
    pending_chan_id: id,
    reserve_sat: undefined,
    upfront_shutdown: undefined,
    zero_conf: undefined,
  },
  {accept: false, error: undefined, pending_chan_id: id},
  {
    accept: true,
    csv_delay: 1,
    in_flight_max_msat: '1',
    max_htlc_count: 1,
    min_accept_depth: 1,
    min_htlc_in: '1',
    pending_chan_id: id,
    reserve_sat: 1,
    upfront_shutdown: 'address',
    zero_conf: true,
  },
  {accept: false, error: 'reason', pending_chan_id: id},
];

// The mock LND stream delivers a request, an end and a cancel error
const defaultStream = [
  ['data', rpcRequest],
  ['end', {}],
  ['error', cancelled],
];

// Accept and reject a received request in every way, leaving its details
const handleRequest = ({accept, reject, ...request}) => {
  accept();
  reject();
  accept({});
  reject({});
  accept({
    cooperative_close_address: 'address',
    is_trusted_funding: true,
    min_confirmations: 1,
    remote_csv: 1,
    remote_max_htlcs: 1,
    remote_max_pending_mtokens: '1',
    remote_min_htlc_mtokens: '1',
    remote_reserve: 1,
  });
  reject({reason: 'reason'});

  return request;
};

const tests = [
  {
    args: {},
    description: 'An LND object is required to subscribe to open requests',
    error: 'ExpectedLndToSubscribeToChannelRequests',
  },
  {
    args: {},
    description: 'An error event is triggered when getting an invalid request',
    expected: {
      events: [
        {
          event: 'error',
          data: [503, 'ExpectedChainHashForChannelOpenRequest'],
        },
        {event: 'error', data: cancelled},
      ],
      writes: [],
    },
    stream: [['data', 'data'], ['error', cancelled]],
  },
  {
    args: {},
    description: 'Channel open request events are returned',
    expected: {
      events: [
        request,
        {event: 'end', data: {}},
        {event: 'error', data: cancelled},
      ],
      writes,
    },
  },
  {
    args: {},
    description: 'Stream errors are ignored without an error listener',
    expected: {events: [], writes: []},
    listening: [channelRequest],
    stream: [['error', {details: 'err'}]],
  },
  {
    args: {},
    description: 'A throwing listener is reported without ending the stream',
    expected: {
      events: [request, listenerFailure, request, listenerFailure],
      writes: [].concat(writes).concat(writes),
    },
    stream: [['data', rpcRequest], ['data', rpcRequest]],
    throwing: [channelRequest],
  },
  {
    args: {},
    description: 'Removing the last request listener cancels the stream',
    expected: {cancels: ['cancel'], events: [], writes: []},
    removing: ['error', channelRequest],
    stream: [],
  },
];

tests.forEach(({args, description, error, expected, ...scenario}) => {
  return test(description, async () => {
    if (!!error) {
      throws(() => subscribeToOpenRequests(args), new Error(error), 'Got err');

      return;
    }

    const written = [];

    const got = await subscriptionEvents({
      ...scenario,
      events: [channelRequest, 'end', 'error'],
      handling: {[channelRequest]: handleRequest},
      stream: scenario.stream || defaultStream,
      subscribe: stream => {
        stream.write = write => written.push(write);

        args.lnd = {default: {channelAcceptor: () => stream}};

        return subscribeToOpenRequests(args);
      },
    });

    deepStrictEqual(
      {...got, writes: written},
      {cancels: [], ...expected},
      'Got expected events'
    );

    return;
  });
});
