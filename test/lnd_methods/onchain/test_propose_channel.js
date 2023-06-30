const {deepStrictEqual} = require('node:assert').strict;
const EventEmitter = require('node:events');
const {rejects} = require('node:assert').strict;
const test = require('node:test');

const {proposeChannel} = require('./../../../lnd_methods');

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
            emitter.emit('error', 'err');
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
    wallet: {
      deriveKey: ({}, cbk) => cbk(null, {
        key_loc: {key_index: 0},
        raw_key_bytes: Buffer.alloc(1),
      }),
    },
  };

  return lnd;
};

const makeArgs = overrides => {
  const args = {
    capacity: 1e6,
    chain_fee_tokens_per_vbyte: 1,
    close_address: 'close_address',
    id: Buffer.alloc(32).toString('hex'),
    key_index: 0,
    lnd: makeLnd({}),
    give_tokens: 1,
    partner_public_key: Buffer.alloc(33).toString('hex'),
    remote_key: Buffer.alloc(33, 2).toString('hex'),
    transaction_id: Buffer.alloc(32).toString('hex'),
    transaction_vout: 0,
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
      wallet: {
        deriveKey: ({}, cbk) => cbk(null, {
          key_loc: {key_index: 0},
          raw_key_bytes: Buffer.alloc(1),
        }),
      },
    },
  });
};

const tests = [
  {
    args: makeArgs({capacity: undefined}),
    description: 'Channel capacity is required',
    error: [400, 'ExpectedCapacityTokensToProposeChannelOpen'],
  },
  {
    args: makeArgs({id: undefined}),
    description: 'Pending channel id is required',
    error: [400, 'ExpectedPendingChannelIdToProposeChannelOpen'],
  },
  {
    args: makeArgs({key_index: undefined}),
    description: 'Key index is required',
    error: [400, 'ExpectedMultiSigKeyIndexToProposeChannelOpen'],
  },
  {
    args: makeArgs({lnd: undefined}),
    description: 'LND is required',
    error: [400, 'ExpectedLndToProposeChannelOpen'],
  },
  {
    args: makeArgs({partner_public_key: undefined}),
    description: 'A public key is required',
    error: [400, 'ExpectedPartnerPublicKeyToProposeChannelOpen'],
  },
  {
    args: makeArgs({remote_key: undefined}),
    description: 'The remote multisig key is required',
    error: [400, 'ExpectedRemoteMultiSigKeyToProposeChannelOpen'],
  },
  {
    args: makeArgs({transaction_id: undefined}),
    description: 'The transaction id is required',
    error: [400, 'ExpectedFundingTransactionIdToProposeChanOpen'],
  },
  {
    args: makeArgs({transaction_vout: undefined}),
    description: 'The transaction output index is required',
    error: [400, 'ExpectedFundingTransactionVoutToProposeChanOpen'],
  },
  {
    args: makeArgs({lnd: makeLnd({err: 'err'})}),
    description: 'An error is encountered',
    error: [503, 'UnexpectedErrorProposingChannelToPeer'],
  },
  {
    args: makeArgs({}),
    description: 'A channel is proposed',
    expected: {},
  },
  {
    args: makeArgs({give_tokens: undefined}),
    description: 'A channel is proposed with no gift',
    expected: {},
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async () => {
    if (!!error) {
      await rejects(proposeChannel(args), error, 'Got expected error');
    } else {
      const res = await proposeChannel(args);

      deepStrictEqual(res, expected, 'Got expected result');
    }

    return;
  });
});
