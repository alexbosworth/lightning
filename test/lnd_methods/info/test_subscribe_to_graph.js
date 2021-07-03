const EventEmitter = require('events');
const {promisify} = require('util');

const {test} = require('@alexbosworth/tap');

const {subscribeToGraph} = require('./../../../');

const nextTick = promisify(process.nextTick);

const makeLnd = ({}) => {
  return {
    default: {
      getNodeInfo: ({}, cbk) => {
        return cbk(null, {
          channels: [],
          node: {
            addresses: [{addr: 'addr', network: 'network'}],
            alias: 'alias',
            color: '#123456',
            features: {'1': {is_known: true, is_required: false}},
            last_update: 1,
            pub_key: Buffer.alloc(33).toString('hex'),
          },
          num_channels: 1,
          total_capacity: 1,
        });
      },
      subscribeChannelGraph: ({}) => {
        const emitter = new EventEmitter();

        emitter.cancel = () => {};

        process.nextTick(() => {
          emitter.emit('data', {
            channel_updates: [{
              advertising_node: Buffer.alloc(33).toString('hex'),
              capacity: '1',
              chan_id: '1',
              chan_point: {
                funding_txid_bytes: Buffer.alloc(32, 1),
                output_index: 0,
              },
              connecting_node: Buffer.alloc(33, 1).toString('hex'),
              routing_policy: {
                disabled: false,
                fee_base_msat: '1',
                fee_rate_milli_msat: '1',
                max_htlc_msat: '1',
                min_htlc: '1',
                time_lock_delta: 1,
              },
            }],
            closed_chans: [{
              capacity: '1',
              chan_id: '1',
              chan_point: {
                funding_txid_bytes: Buffer.alloc(32, 1),
                output_index: 1,
              },
              closed_height: 1,
            }],
            node_updates: [{
              addresses: ['addr'],
              alias: 'alias',
              color: '#123456',
              features: {'1': {is_known: true, is_required: false}},
              identity_key: Buffer.alloc(33).toString('hex'),
            }],
          });

          emitter.emit('error', 'error');

          return;
        });

        return emitter;
      },
    },
    version: {
      getVersion: ({}, cbk) => cbk(err, {
        app_minor: 1,
        app_patch: 1,
        build_tags: ['autopilotrpc'],
        commit_hash: Buffer.alloc(20).toString('hex'),
      }),
    },
  };
};

const tests = [
  {
    args: {lnd: undefined},
    description: 'LND object is required to subscribe to graph',
    error: 'ExpectedAuthenticatedLndToSubscribeToChannelGraph',
  },
  {
    args: {
      lnd: {
        default: {
          subscribeChannelGraph: ({}) => {
            const emitter = new EventEmitter();

            emitter.cancel = () => {};

            process.nextTick(() => {
              return emitter.emit('data', {
                channel_updates: undefined,
                closed_chans: [],
                node_updates: [],
              });
            });

            return emitter;
          },
        },
        version: {
          getVersion: ({}, cbk) => cbk(err, {
            app_minor: 1,
            app_patch: 1,
            build_tags: ['autopilotrpc'],
            commit_hash: Buffer.alloc(20).toString('hex'),
          }),
        },
      },
    },
    description: 'Updates are expected',
    expected: {
      events: [{
        data: new Error('ExpectedChannelUpdates'),
        event: 'error',
      }],
    },
  },
  {
    args: {
      lnd: {
        default: {
          subscribeChannelGraph: ({}) => {
            const emitter = new EventEmitter();

            emitter.cancel = () => {};

            process.nextTick(() => {
              return emitter.emit('data', {
                channel_updates: [],
                closed_chans: undefined,
                node_updates: [],
              });
            });

            return emitter;
          },
        },
        version: {
          getVersion: ({}, cbk) => cbk(err, {
            app_minor: 1,
            app_patch: 1,
            build_tags: ['autopilotrpc'],
            commit_hash: Buffer.alloc(20).toString('hex'),
          }),
        },
      },
    },
    description: 'Closed channels are expected',
    expected: {
      events: [{
        data: new Error('ExpectedClosedChans'),
        event: 'error',
      }],
    },
  },
  {
    args: {
      lnd: {
        default: {
          subscribeChannelGraph: ({}) => {
            const emitter = new EventEmitter();

            emitter.cancel = () => {};

            process.nextTick(() => {
              return emitter.emit('data', {
                channel_updates: [],
                closed_chans: [],
                node_updates: undefined,
              });
            });

            return emitter;
          },
        },
        version: {
          getVersion: ({}, cbk) => cbk(err, {
            app_minor: 1,
            app_patch: 1,
            build_tags: ['autopilotrpc'],
            commit_hash: Buffer.alloc(20).toString('hex'),
          }),
        },
      },
    },
    description: 'Node updates are expected',
    expected: {
      events: [{
        data: new Error('ExpectedNodeUpdates'),
        event: 'error',
      }],
    },
  },
  {
    args: {
      lnd: {
        default: {
          subscribeChannelGraph: ({}) => {
            const emitter = new EventEmitter();

            emitter.cancel = () => {};

            process.nextTick(() => {
              return emitter.emit('data', {
                channel_updates: [null],
                closed_chans: [],
                node_updates: [],
              });
            });

            return emitter;
          },
        },
      },
    },
    description: 'Update errors are emitted',
    expected: {
      events: [{
        data: new Error('ExpectedChannelUpdateDetails'),
        event: 'error',
      }],
    },
  },
  {
    args: {
      lnd: {
        default: {
          subscribeChannelGraph: ({}) => {
            const emitter = new EventEmitter();

            emitter.cancel = () => {};

            process.nextTick(() => {
              return emitter.emit('data', {
                channel_updates: [],
                closed_chans: [null],
                node_updates: [],
              });
            });

            return emitter;
          },
        },
        version: {
          getVersion: ({}, cbk) => cbk(err, {
            app_minor: 1,
            app_patch: 1,
            build_tags: ['autopilotrpc'],
            commit_hash: Buffer.alloc(20).toString('hex'),
          }),
        },
      },
    },
    description: 'Closed errors are emitted',
    expected: {
      events: [{
        data: new Error('ExpectedChannelClosedUpdateDetails'),
        event: 'error',
      }],
    },
  },
  {
    args: {
      lnd: {
        default: {
          subscribeChannelGraph: ({}) => {
            const emitter = new EventEmitter();

            emitter.cancel = () => {};

            process.nextTick(() => {
              return emitter.emit('data', {
                channel_updates: [],
                closed_chans: [],
                node_updates: [null],
              });
            });

            return emitter;
          },
        },
        version: {
          getVersion: ({}, cbk) => cbk(err, {
            app_minor: 1,
            app_patch: 1,
            build_tags: ['autopilotrpc'],
            commit_hash: Buffer.alloc(20).toString('hex'),
          }),
        },
      },
    },
    description: 'Node errors are emitted',
    expected: {
      events: [{
        data: new Error('ExpectedDetailsInNodeUpdateAnnouncement'),
        event: 'error',
      }],
    },
  },
  {
    args: {
      lnd: {
        default: {
          subscribeChannelGraph: ({}) => {
            const emitter = new EventEmitter();

            emitter.cancel = () => {};

            process.nextTick(() => {
              return emitter.emit('data', {
                channel_updates: [],
                closed_chans: [],
                node_updates: [{}],
              });
            });

            return emitter;
          },
        },
        version: {
          getVersion: ({}, cbk) => cbk(err, {
            app_minor: 1,
            app_patch: 1,
            build_tags: ['autopilotrpc'],
            commit_hash: Buffer.alloc(20).toString('hex'),
          }),
        },
      },
    },
    description: 'Node public key is expected',
    expected: {
      events: [{
        data: new Error('ExpectedPubKeyInNodeUpdateAnnouncement'),
        event: 'error',
      }],
    },
  },
  {
    args: {
      lnd: {
        default: {
          subscribeChannelGraph: ({}) => {
            const emitter = new EventEmitter();

            emitter.cancel = () => {};

            process.nextTick(() => {
              return emitter.emit('data', {
                channel_updates: [],
                closed_chans: [],
                node_updates: [{
                  identity_key: Buffer.alloc(33).toString('hex'),
                }],
              });
            });

            return emitter;
          },
        },
        version: {
          getVersion: ({}, cbk) => cbk(err, {
            app_minor: 1,
            app_patch: 1,
            build_tags: ['autopilotrpc'],
            commit_hash: Buffer.alloc(20).toString('hex'),
          }),
        },
      },
    },
    description: 'Get node errors are passed back',
    expected: {
      events: [{
        data: [400, 'ExpectedLndApiObjectToGetNodeInfo'],
        event: 'error',
      }],
    },
  },
  {
    args: {
      lnd: {
        default: {
          getNodeInfo: ({}, cbk) => {
            return cbk(null, {
              channels: [],
              node: {
                addresses: [{addr: 'addr', network: 'network'}],
                alias: 'alias',
                color: '#123456',
                features: {'1': {is_known: true, is_required: false}},
                last_update: 0,
                pub_key: Buffer.alloc(33).toString('hex'),
              },
              num_channels: 1,
              total_capacity: 1,
            });
          },
          subscribeChannelGraph: ({}) => {
            const emitter = new EventEmitter();

            emitter.cancel = () => {};

            process.nextTick(() => {
              return emitter.emit('data', {
                channel_updates: [],
                closed_chans: [],
                node_updates: [{
                  identity_key: Buffer.alloc(33).toString('hex'),
                }],
              });
            });

            return emitter;
          },
        },
        version: {
          getVersion: ({}, cbk) => cbk(null, {
            app_minor: 1,
            app_patch: 1,
            build_tags: ['autopilotrpc'],
            commit_hash: Buffer.alloc(20).toString('hex'),
          }),
        },
      },
    },
    description: 'Get node does not require updated at',
    expected: {
      events: [{
        data: {
          alias: 'alias',
          color: '#123456',
          features: [{
            bit: 1,
            is_known: true,
            is_required: false,
            type: 'data_loss_protection',
          }],
          public_key: '000000000000000000000000000000000000000000000000000000000000000000',
          sockets: ['addr'],
        },
        event: 'node_updated',
      }],
    },
  },
  {
    args: {lnd: makeLnd({})},
    description: 'Graph events are received',
    expected: {
      events: [
        {
          event: 'channel_updated',
          data: {
            base_fee_mtokens: '1',
            capacity: 1,
            cltv_delta: 1,
            fee_rate: 1,
            id: '0x0x1',
            is_disabled: false,
            max_htlc_mtokens: '1',
            min_htlc_mtokens: '1',
            public_keys: [
              '000000000000000000000000000000000000000000000000000000000000000000',
              '010101010101010101010101010101010101010101010101010101010101010101',
            ],
            transaction_id: '0101010101010101010101010101010101010101010101010101010101010101',
            transaction_vout: 0,
          },
        },
        {
          event: 'channel_closed',
          data: {
            capacity: 1,
            close_height: 1,
            id: '0x0x1',
            transaction_id: '0101010101010101010101010101010101010101010101010101010101010101',
            transaction_vout: 1,
          },
        },
        {
          event: 'node_updated',
          data: {
            alias: 'alias',
            color: '#123456',
            features: [{
              bit: 1,
              is_known: true,
              is_required: false,
              type: 'data_loss_protection'
            }],
            public_key: '000000000000000000000000000000000000000000000000000000000000000000',
            sockets: ['addr'],
          },
        },
        {
          event: 'error',
          data: 'error',
        },
      ],
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, equal, match, strictSame, throws}) => {
    if (!!error) {
      throws(() => subscribeToGraph(args), new Error(error), 'Got error');
    } else {
      const events = [];

      const sub = subscribeToGraph(args);

      ['channel_closed', 'channel_updated', 'error', 'node_updated']
        .forEach(event => sub.on(event, data => events.push({event, data})));

      await nextTick();

      sub.removeAllListeners();

      subscribeToGraph(args);

      await nextTick();

      const gotEvents = events.map(got => {
        delete got.data.updated_at;

        return got;
      });

      strictSame(gotEvents, expected.events, 'Got expected graph events');
    }

    return end();
  });
});
