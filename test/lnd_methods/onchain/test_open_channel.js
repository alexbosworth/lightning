const EventEmitter = require('events');

const {test} = require('@alexbosworth/tap');

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
            emitter.emit('status', {});
            emitter.emit('data', {
              chan_pending: {
                output_index: 0,
                txid: Buffer.from('01020304', 'hex'),
              },
              update: 'chan_pending',
            });
            emitter.emit('data', {update: 'chan_open'});
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
    chain_fee_tokens_per_vbyte: 1,
    close_address: 'close_address',
    lnd: makeLnd({}),
    give_tokens: 1,
    local_tokens: 1e6,
    partner_public_key: Buffer.alloc(33).toString('hex'),
  };

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const makeStatus = details => {
  return makeArgs({
    lnd: {
      default: {
        openChannel: ({}) => {
          const emitter = new EventEmitter();

          process.nextTick(() => emitter.emit('status', {details}));

          return emitter;
        },
      },
    },
  });
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
  {
    args: makeStatus(''),
    description: 'A random error is encountered',
    error: [503, 'UnknownChannelOpenStatus'],
  },
  {
    args: makeStatus('peer is not online'),
    description: 'Remote node is not online',
    error: [503, 'PeerIsNotOnline'],
  },
  {
    args: makeStatus('multiple channels unsupported'),
    description: 'Detect cl error',
    error: [503, 'RemoteNodeDoesNotSupportMultipleChannels'],
  },
  {
    args: makeStatus('not enough witness outputs to create funding'),
    description: 'Need more money error',
    error: [400, 'InsufficientFundsToCreateChannel'],
  },
  {
    args: makeStatus('disconnected'),
    description: 'Peer disconnected',
    error: [503, 'RemotePeerDisconnected'],
  },
  {
    args: makeStatus('pending channels exceed maximum'),
    description: 'Peer has existing pending requests',
    error: [503, 'PeerPendingChannelsExceedMaximumAllowable'],
  },
  {
    args: makeStatus('Unknown chain'),
    description: 'Peer does not recognize this chain',
    error: [503, 'ChainUnsupported'],
  },
  {
    args: makeStatus('cannot open channel to self'),
    description: 'You cannot open with yourself',
    error: [400, 'CannotOpenChannelToOwnNode'],
  },
  {
    args: makeStatus(
      'channels cannot be created before the wallet is fully synced'
    ),
    description: 'The wallet must be in sync',
    error: [503, 'WalletNotFullySynced'],
  },
  {
    args: makeStatus('unable to send funding request message: peer exiting'),
    description: 'Peer is messing up somehow',
    error: [503, 'RemotePeerExited'],
  },
  {
    args: makeStatus('Synchronizing blockchain'),
    description: 'A synchronizing blockchain error is encountered',
    error: [503, 'RemoteNodeSyncing'],
  },
  {
    args: makeStatus('err'),
    description: 'A random error is returned',
    error: [503, 'FailedToOpenChannel', {err: 'err'}],
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, rejects, strictSame}) => {
    if (!!error) {
      await rejects(openChannel(args), error, 'Got expected error');
    } else {
      const res = await openChannel(args);

      strictSame(res, expected, 'Got expected result');
    }

    return end();
  });
});
