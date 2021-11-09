const EventEmitter = require('events');
const {promisify} = require('util');

const {test} = require('@alexbosworth/tap');

const nextTick = promisify(process.nextTick);
const {subscribeToRpcRequests} = require('./../../../lnd_methods');

const makeArgs = overrides => {
  const args = {
    lnd: {
      default: {
        RegisterRPCMiddleware: ({}) => {
          const emitter = new EventEmitter();

          emitter.cancel = () => {};
          emitter.write = ({}, cbk) => cbk();

          process.nextTick(() => {
            emitter.emit('data', {
              msg_id: '1',
              request_id: '1',
              raw_macaroon: Buffer.alloc(0),
              custom_caveat_condition: '',
              stream_auth: {method_full_uri: 'method_full_uri'},
              intercept_type: 'stream_auth',
            });

            emitter.emit('data', {});

            emitter.emit('status', {status: 'status'});
            emitter.emit('end', {});
            emitter.emit('error', {details: 'Cancelled on client'});
          });

          return emitter;
        },
      },
    },
  };

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

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
    description: 'RPC write errors are passed back',
    error: [503, 'UnexpectedErrInterceptingRpcRequests', {err: 'err'}],
  },
  {
    args: makeArgs({
      lnd: {
        default: {
          RegisterRPCMiddleware: ({}) => {
            const emitter = new EventEmitter();

            emitter.cancel = () => {};
            emitter.write = (args, cbk) => {
              if (!!args.feedback) {
                return cbk('err');
              }

              return cbk();
            };

            process.nextTick(() => {
              emitter.emit('data', {
                msg_id: '1',
                request_id: '1',
                raw_macaroon: Buffer.alloc(0),
                custom_caveat_condition: '',
                stream_auth: {method_full_uri: 'method_full_uri'},
                intercept_type: 'stream_auth',
              });
            });

            return emitter;
          },
        },
      },
    }),
    description: 'RPC write errors are passed back',
    expected: {
      events: [
        {call: 1, id: 1, macaroon: undefined, uri: 'method_full_uri'},
        [503, 'UnexpectedErrorAcceptingRpcRequest', {err: 'err'}],
      ],
    },
  },
  {
    args: makeArgs({}),
    description: 'RPC request subscription is returned',
    expected: {
      events: [
        {call: 1, id: 1, macaroon: undefined, uri: 'method_full_uri'},
        [503, 'ExpectedCustomCaveatConditionInRpcRequestUpdate'],
        {details: 'Cancelled on client'},
      ],
    },
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
    description: 'RPC write errors are passed back',
    error: [503, 'UnexpectedErrInterceptingRpcRequests', {err: 'err'}],
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
          RegisterRPCMiddleware: ({}) => {
            const emitter = new EventEmitter();

            emitter.cancel = () => {};
            emitter.write = ({}, cbk) => cbk();

            process.nextTick(() => {
              emitter.emit('data', {
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
              });
            });

            return emitter;
          },
        },
      },
    }),
    description: 'An open channel request is intercepted',
    expected: {
      events: [],
      intercepts: [{
        accept: true,
        id: 1,
        macaroon: undefined,
        reject: true,
        request: {
          chain_fee_tokens_per_vbyte: 1,
          cooperative_close_address: 'close_address',
          give_tokens: 1,
          is_private: undefined,
          local_tokens: 1,
          min_confirmations: 0,
          min_htlc_mtokens: '1',
          partner_public_key: '030303030303030303030303030303030303030303030303030303030303030303',
          partner_csv_delay: 1,
        },
        uri: '/lnrpc.Lightning/OpenChannel',
      }],
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, rejects, strictSame}) => {
    if (!!error) {
      await rejects(() => subscribeToRpcRequests(args), error, 'Got err');
    } else {
      const events = [];
      const intercepts = [];
      const res = await subscribeToRpcRequests(args);

      res.subscription.on('error', event => events.push(event));
      res.subscription.on('request', event => events.push(event));

      res.subscription.on('open_channel_request', openRequest => {
        return intercepts.push({
          accept: !!openRequest.accept,
          id: openRequest.id,
          macaroon: openRequest.macaroon,
          reject: !!openRequest.reject,
          uri: openRequest.uri,
          request: openRequest.request,
        });
      });

      await nextTick();

      if (!!expected.intercepts) {
        strictSame(intercepts, expected.intercepts, 'Got expected intercepts');
      }

      strictSame(events, expected.events, 'Got expected events');
      strictSame(!!res.subscription, true, 'Got subscription');
    }

    return end();
  });
});
