const {deepStrictEqual} = require('node:assert').strict;
const {rejects} = require('node:assert').strict;
const test = require('node:test');

const {subscribeToRpcRequests} = require('./../../../lnd_methods');
const {subscriptionEvents} = require('./../macros');

const cancelled = {details: 'Cancelled on client'};
const listenerFailure = {event: 'error', data: [503, 'ListenerFailure']};
const makeArgs = overrides => {
  const args = {lnd: {default: {}}};

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};
const openChannelUpdate = {
  msg_id: '1',
  request_id: '1',
  raw_macaroon: Buffer.alloc(0),
  custom_caveat_condition: '',
  request: {
    method_full_uri: '/lnrpc.Lightning/OpenChannel',
    serialized: Buffer.alloc(0),
    stream_rpc: false,
    type_name: '',
  },
  intercept_type: 'request',
};
const request = {
  event: 'request',
  data: {call: 1, id: 1, macaroon: undefined, uri: 'method_full_uri'},
};
const streamAuth = {
  msg_id: '1',
  request_id: '1',
  raw_macaroon: Buffer.alloc(0),
  custom_caveat_condition: '',
  stream_auth: {method_full_uri: 'method_full_uri'},
  intercept_type: 'stream_auth',
};

// Intercepted requests carry accept and reject functions, note their presence
const asIntercept = ({accept, reject, ...intercept}) => ({
  ...intercept,
  accept: !!accept,
  reject: !!reject,
});

const tests = [
  {
    args: makeArgs({id: '1234'}),
    description: 'A long id is required to subscribe to RPC requests',
    error: [400, 'ExpectedLongerIdLengthToSpecifyMiddlewareName'],
  },
  {
    args: makeArgs({lnd: undefined}),
    description: 'LND is required to subscribe to rpc requests',
    error: [400, 'ExpectedLndToSubscribeToRpcRequests'],
  },
  {
    args: makeArgs({
      lnd: {
        default: {
          RegisterRPCMiddleware: ({}) => ({
            on: (event, cbk) => {},
            write: ({}, cbk) => cbk('err'),
          }),
        },
      },
    }),
    description: 'RPC registration write errors are passed back',
    error: [503, 'UnexpectedErrInterceptingRpcRequests', {err: 'err'}],
  },
  {
    args: makeArgs({}),
    description: 'RPC accept write errors are emitted',
    expected: {
      cancels: ['cancel'],
      events: [
        request,
        {
          event: 'error',
          data: [503, 'UnexpectedErrorAcceptingRpcRequest', {err: 'err'}],
        },
      ],
    },
    write_errors: {feedback: 'err'},
  },
  {
    args: makeArgs({}),
    description: 'RPC request subscription is returned',
    expected: {
      cancels: ['cancel', 'cancel'],
      events: [
        request,
        {
          event: 'error',
          data: [503, 'ExpectedCustomCaveatConditionInRpcRequestUpdate'],
        },
        {event: 'status', data: {status: 'status'}},
        {event: 'end', data: undefined},
        {event: 'error', data: cancelled},
      ],
    },
    stream: [
      ['data', streamAuth],
      ['data', {}],
      ['status', {status: 'status'}],
      ['end', {}],
      ['error', cancelled],
    ],
  },
  {
    args: makeArgs({
      is_intercepting_open_channel_requests: true,
      lnd: {
        default: {
          OpenChannel: {
            requestDeserialize: () => ({
              close_address: 'close_address',
              local_funding_amount: '1',
              min_htlc_msat: '1',
              node_pubkey: Buffer.alloc(33, 3),
              node_pubkey_string: Buffer.alloc(33, 3).toString('hex'),
              private: false,
              push_sat: '1',
              remote_csv_delay: 1,
              sat_per_byte: '1',
              sat_per_vbyte: '1',
              spend_unconfirmed: true,
              target_conf: 1,
            }),
          },
        },
      },
    }),
    description: 'An open channel request is intercepted',
    expected: {
      events: [{
        event: 'open_channel_request',
        data: {
          accept: true,
          id: 1,
          macaroon: undefined,
          reject: true,
          request: {
            base_fee_mtokens: undefined,
            chain_fee_tokens_per_vbyte: 1,
            cooperative_close_address: 'close_address',
            description: undefined,
            fee_rate: undefined,
            give_tokens: 1,
            is_max_funding: undefined,
            is_private: undefined,
            local_tokens: 1,
            min_confirmations: 0,
            min_htlc_mtokens: '1',
            partner_public_key: Buffer.alloc(33, 3).toString('hex'),
            partner_csv_delay: 1,
          },
          uri: '/lnrpc.Lightning/OpenChannel',
        },
      }],
      writes: ['register'],
    },
    stream: [['data', openChannelUpdate]],
  },
  {
    args: makeArgs({}),
    description: 'A throwing listener is reported without ending the stream',
    expected: {events: [request, listenerFailure]},
    stream: [['data', {intercept_type: 'reg_complete'}], ['data', streamAuth]],
    throwing: ['request'],
  },
];

tests.forEach(({args, description, error, expected, ...scenario}) => {
  return test(description, async () => {
    if (!!error) {
      await rejects(() => subscribeToRpcRequests(args), error, 'Got err');

      return;
    }

    const writes = [];

    const got = await subscriptionEvents({
      ...scenario,
      events: ['end', 'error', 'open_channel_request', 'request', 'status'],
      handling: {open_channel_request: asIntercept},
      stream: scenario.stream || [['data', streamAuth]],
      subscribe: stream => {
        const errors = scenario.write_errors || {};

        // Writes are recorded by their type and fail when the case says so
        stream.write = (data, cbk) => {
          const [type] = Object.keys(data);

          writes.push(type);

          return cbk(errors[type]);
        };

        args.lnd.default.RegisterRPCMiddleware = () => stream;

        return subscribeToRpcRequests(args).then(n => n.subscription);
      },
    });

    deepStrictEqual(
      {...got, writes},
      {cancels: [], writes: ['register', 'feedback'], ...expected},
      'Got expected events'
    );

    return;
  });
});
