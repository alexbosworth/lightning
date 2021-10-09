const EventEmitter = require('events');

const {test} = require('@alexbosworth/tap');

const {closeChannel} = require('./../../../lnd_methods');

const makeLnd = ({err, data}) => {
  const lnd = {
    default: {
      closeChannel: ({}) => {
        const emitter = new EventEmitter();

        emitter.cancel = () => {};

        process.nextTick(() => {

          if (!!err) {
            return emitter.emit('error', err);
          }

          emitter.emit('data', {update: 'chan_close'});
          emitter.emit('data', {update: 'confirmation'});
          emitter.emit('data', {update: 'unknown'});
          emitter.emit('status', {});
          emitter.emit('end', {});

          if (!!data) {
            emitter.emit('data', data);
          } else {
            emitter.emit('data', {
              close_pending: {
                output_index: 0,
                txid: Buffer.from('01020304', 'hex'),
              },
              update: 'close_pending',
            });
            emitter.emit('data', {
              close_pending: {
                output_index: 0,
                txid: Buffer.from('01020304', 'hex'),
              },
              update: 'close_pending',
            });
          }
        });

        return emitter;
      },
      connectPeer: ({}, cbk) => cbk(null, {}),
      getChanInfo: ({}, cbk) => {
        return cbk(null, {
          capacity: '1',
          chan_point: `${Buffer.alloc(32).toString('hex')}:0`,
          channel_id: '000000000',
          node1_policy: {
            disabled: true,
            fee_base_msat: '1',
            fee_rate_milli_msat: '1',
            last_update: 1,
            max_htlc_msat: '1',
            min_htlc: '1',
            time_lock_delta: 1,
          },
          node1_pub: Buffer.alloc(33).toString('hex'),
          node2_policy: {
            disabled: false,
            fee_base_msat: '2',
            fee_rate_milli_msat: '2',
            last_update: 1,
            max_htlc_msat: '2',
            min_htlc: '2',
            time_lock_delta: 2,
          },
          node2_pub: Buffer.alloc(33, 1).toString('hex'),
        });
      },
      listPeers: ({}, cbk) => cbk(null, {
        peers: [{
          address: 'address',
          bytes_recv: '0',
          bytes_sent: '0',
          features: {},
          flap_count: 0,
          last_flap_ns: '0',
          inbound: false,
          ping_time: '0',
          pub_key: Buffer.alloc(33).toString('hex'),
          sat_recv: '0',
          sat_sent: '0',
          sync_type: 'ACTIVE_SYNC',
        }],
      }),
    },
  };

  return lnd;
};

const makeArgs = overrides => {
  const args = {
    lnd: makeLnd({}),
    transaction_id: Buffer.alloc(32).toString('hex'),
    transaction_vout: 0,
  };

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const tests = [
  {
    args: makeArgs({address: 'address', is_force_close: true}),
    description: 'Address cannot be specified on force close',
    error: [400, 'ExpectedCoopCloseWhenCloseAddressSpecified'],
  },
  {
    args: makeArgs({transaction_id: undefined, transaction_vout: undefined}),
    description: 'Either id or transaction outpoint must be specified',
    error: [400, 'ExpectedIdOfChannelToClose'],
  },
  {
    args: makeArgs({lnd: undefined}),
    description: 'LND is required',
    error: [400, 'ExpectedLndToExecuteChannelClose'],
  },
  {
    args: makeArgs({public_key: 'public_key'}),
    description: 'A socket is required when public key is specified',
    error: [400, 'ExpectedBothPublicKeyAndSocketForChannelClose'],
  },
  {
    args: makeArgs({socket: 'socket'}),
    description: 'A public key is required when public key is specified',
    error: [400, 'ExpectedBothPublicKeyAndSocketForChannelClose'],
  },
  {
    args: makeArgs({target_confirmations: 1, tokens_per_vbyte: 1}),
    description: 'Either confs or fee rate is allowed, not both',
    error: [400, 'UnexpectedTokensPerVbyteForChannelClose'],
  },
  {
    args: makeArgs({is_force_close: true, tokens_per_vbyte: 1}),
    description: 'Setting fee rate is not allowed on force closes',
    error: [400, 'UnexpectedFeeSettingForForceCloseChannel'],
  },
  {
    args: makeArgs({lnd: makeLnd({data: {update: 'close_pending'}})}),
    description: 'Close pending data is expected',
    error: [503, 'ExpectedClosePendingData'],
  },
  {
    args: makeArgs({lnd: makeLnd({err: 'err'})}),
    description: 'Opening error event is returned',
    error: [503, 'UnexpectedCloseChannelError', {err: 'err'}],
  },
  {
    args: makeArgs({
      lnd: makeLnd({data: {close_pending: {}, update: 'close_pending'}}),
    }),
    description: 'Close tx vout is expected',
    error: [503, 'ExpectedOutputIndexForPendingChanClose'],
  },
  {
    args: makeArgs({
      lnd: makeLnd({
        data: {
          close_pending: {output_index: 0},
          update: 'close_pending',
        },
      }),
    }),
    description: 'Close tx id is expected',
    error: [503, 'ExpectedClosePendingTransactionId'],
  },
  {
    args: makeArgs({
      public_key: Buffer.alloc(33).toString('hex'),
      socket: 'socket',
    }),
    description: 'A peer is connected before closing',
    expected: {transaction_id: '04030201', transaction_vout: 0},
  },
  {
    args: makeArgs({id: 'id'}),
    description: 'An id can be specified instead of the outpoint',
    expected: {transaction_id: '04030201', transaction_vout: 0},
  },
  {
    args: makeArgs({}),
    description: 'A channel is closed',
    expected: {transaction_id: '04030201', transaction_vout: 0},
  },
  {
    args: makeArgs({tokens_per_vbyte: 1}),
    description: 'A channel is closed with a tx fee',
    expected: {transaction_id: '04030201', transaction_vout: 0},
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, rejects, strictSame}) => {
    if (!!error) {
      await rejects(closeChannel(args), error, 'Got expected error');
    } else {
      const res = await closeChannel(args);

      strictSame(res, expected, 'Got expected result');
    }

    return end();
  });
});
