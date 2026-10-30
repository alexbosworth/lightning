const {deepStrictEqual} = require('node:assert').strict;
const EventEmitter = require('node:events');
const {rejects} = require('node:assert').strict;
const test = require('node:test');

const {openChannel} = require('./../../../lnd_methods');

const makeLnd = ({err, data}) => {
  const lnd = {
    requests: [],
    default: {
      openChannel: options => {
        const emitter = new EventEmitter();

        lnd.requests.push(options);

        emitter.cancel = () => {};

        process.nextTick(() => {
          // A stream error is ignored, the failure arrives as a status
          if (!!err) {
            emitter.emit('error', err);

            return emitter.emit('status', {details: err});
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
          flap_count: 0,
          inbound: false,
          last_flap_ns: '0',
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
    lnd: makeLnd({}),
    give_tokens: 1,
    local_tokens: 1e6,
    is_allowing_minimal_reserve: true,
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
    args: makeArgs({inputs: 'inputs'}),
    description: 'A channel is opened with a tx id set',
    error: [400, 'ExpectedArrayOfTransactionOutpointsAsInputs'],
  },
  {
    args: makeArgs({partner_socket: 'socket'}),
    description: 'A peer is connected before opening',
    expected: {transaction_id: '04030201', transaction_vout: 0},
  },
  {
    args: makeArgs({
      inputs: [{
        transaction_id: Buffer.alloc(32).toString('hex'),
        transaction_vout: 0,
      }],
    }),
    description: 'A channel is opened with a tx id set',
    expected: {transaction_id: '04030201', transaction_vout: 0},
  },
  {
    args: makeArgs({}),
    description: 'A channel is opened',
    expected: {transaction_id: '04030201', transaction_vout: 0},
    request: {
      base_fee: undefined,
      close_address: undefined,
      commitment_type: undefined,
      fee_rate: undefined,
      fund_max: undefined,
      local_funding_amount: 1e6,
      memo: undefined,
      min_confs: 1,
      min_htlc_msat: '1',
      node_pubkey: Buffer.alloc(33),
      outpoints: undefined,
      private: false,
      push_sat: 1,
      remote_chan_reserve_sat: 354,
      remote_csv_delay: undefined,
      sat_per_vbyte: 1,
      spend_unconfirmed: false,
      target_conf: undefined,
      use_base_fee: false,
      use_fee_rate: false,
      zero_conf: undefined,
    },
  },
  {
    args: makeArgs({
      base_fee_mtokens: '1000',
      chain_fee_tokens_per_vbyte: undefined,
      cooperative_close_address: 'close_address',
      description: 'description',
      fee_rate: 1,
      is_allowing_minimal_reserve: false,
      is_max_funding: true,
      is_private: true,
      min_confirmations: 0,
      min_htlc_mtokens: '2',
      partner_csv_delay: 144,
    }),
    description: 'Channel open options are derived from the arguments',
    expected: {transaction_id: '04030201', transaction_vout: 0},
    request: {
      base_fee: '1000',
      close_address: 'close_address',
      fee_rate: 1,
      fund_max: true,
      memo: 'description',
      min_confs: 0,
      min_htlc_msat: '2',
      private: true,
      remote_chan_reserve_sat: undefined,
      remote_csv_delay: 144,
      sat_per_vbyte: undefined,
      spend_unconfirmed: true,
      target_conf: 6,
      use_base_fee: true,
      use_fee_rate: true,
    },
  },
  {
    args: makeArgs({is_trusted_funding: true}),
    description: 'A trusted funding channel uses anchors and zero conf',
    expected: {transaction_id: '04030201', transaction_vout: 0},
    request: {commitment_type: 'ANCHORS', zero_conf: true},
  },
  {
    args: makeArgs({is_simplified_taproot: true}),
    description: 'A simplified taproot channel sets its commitment type',
    expected: {transaction_id: '04030201', transaction_vout: 0},
    request: {commitment_type: 'SIMPLE_TAPROOT'},
  },
  {
    args: makeArgs({is_standard_taproot: true}),
    description: 'A standard taproot channel sets its commitment type',
    expected: {transaction_id: '04030201', transaction_vout: 0},
    request: {commitment_type: 'TAPROOT'},
  },
  {
    args: makeStatus('provided memo (memo) is of length 600, exceeds 500'),
    description: 'A description that is too long is an error',
    error: [400, 'MaxChannelDescriptionLengthExceeded', {max: 500}],
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
  {
    args: makeArgs({lnd: makeLnd({err: 'err'})}),
    description: 'A stream error is ignored until a status arrives',
    error: [503, 'FailedToOpenChannel', {err: 'err'}],
  },
];

tests.forEach(({args, description, error, expected, request}) => {
  return test(description, async () => {
    if (!!error) {
      await rejects(openChannel(args), error, 'Got expected error');

      return;
    }

    const res = await openChannel(args);

    deepStrictEqual(res, expected, 'Got expected result');

    // The options sent to LND are checked when the case specifies them
    const [sent] = args.lnd.requests;

    Object.keys(request || {}).forEach(key => {
      return deepStrictEqual(sent[key], request[key], `Got expected ${key}`);
    });

    return;
  });
});
