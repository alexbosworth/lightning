const EventEmitter = require('events');

const {test} = require('tap');

const {openChannel} = require('./../../../lnd_methods');

const makeLnd = ({err, data}) => {
  const lnd = {
    default: {
      openChannel: ({}) => {
        const emitter = new EventEmitter();

        emitter.cancel = () => {};

        process.nextTick(() => {
          if (!!err) {
            return emitter.emit('error', err);
          }

          emitter.emit('data', {update: 'chan_close'});
          emitter.emit('data', {update: 'confirmation'});
          emitter.emit('data', {update: 'unknown'});
          emitter.emit('end', {});

          if (!!data) {
            emitter.emit('data', data);
          } else {
            emitter.emit('data', {
              chan_pending: {
                output_index: 0,
                txid: Buffer.from('01020304', 'hex'),
              },
              update: 'chan_pending',
            });
            emitter.emit('data', {
              chan_pending: {
                output_index: 0,
                txid: Buffer.from('01020304', 'hex'),
              },
              update: 'chan_pending',
            });
          }
        });


        return emitter;
      },
      connectPeer: ({}, cbk) => cbk(null, {}),
      listPeers: ({}, cbk) => cbk(null, {
        peers: [{
          address: 'address',
          bytes_recv: '0',
          bytes_sent: '0',
          features: {},
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
    local_tokens: 1e6,
    partner_public_key: Buffer.alloc(33).toString('hex'),
  };

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const tests = [
  {
    args: makeArgs({lnd: undefined}),
    description: 'LND is required',
    error: [400, 'ExpectedLndForChannelOpen'],
  },
  {
    args: makeArgs({local_tokens: undefined}),
    description: 'Channel capacity is required',
    error: [400, 'ExpectedLocalTokensNumberToOpenChannelWith'],
  },
  {
    args: makeArgs({local_tokens: 1}),
    description: 'Non-negligible channel capacity is required',
    error: [400, 'ExpectedLargerChannelSizeForChannelOpen'],
  },
  {
    args: makeArgs({partner_public_key: undefined}),
    description: 'A public key is required',
    error: [400, 'ExpectedPartnerPublicKeyForChannelOpen'],
  },
  {
    args: makeArgs({
      public_key: Buffer.alloc(33).toString('hex'),
      socket: 'socket',
    }),
    description: 'A peer is connected before opening',
    expected: {transaction_id: '04030201', transaction_vout: 0},
  },
  {
    args: makeArgs({}),
    description: 'A channel is opened',
    expected: {transaction_id: '04030201', transaction_vout: 0},
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({deepIs, end, equal, rejects}) => {
    if (!!error) {
      await rejects(openChannel(args), error, 'Got expected error');
    } else {
      const res = await openChannel(args);

      deepIs(res, expected, 'Got expected result');
    }

    return end();
  });
});
