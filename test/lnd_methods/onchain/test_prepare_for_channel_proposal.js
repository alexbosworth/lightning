const {test} = require('@alexbosworth/tap');

const {prepareForChannelProposal} = require('./../../../lnd_methods');

const makeArgs = overrides => {
  const args = {
    key_index: 1,
    lnd: {
      default: {
        fundingStateStep: ({}, cbk) => cbk(),
      },
      wallet: {
        deriveKey: ({}, cbk) => cbk(null, {
          key_loc: {key_index: 0},
          raw_key_bytes: Buffer.alloc(1),
        }),
      },
    },
    remote_key: Buffer.alloc(33, 2).toString('hex'),
    transaction_id: Buffer.alloc(32).toString('hex'),
    transaction_vout: 0,
  };

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const tests = [
  {
    args: makeArgs({cooperative_close_delay: 5e5}),
    description: 'A short cooperative close delay is expected',
    error: [400, 'ExpectedRelativeBlockHeightCloseDelayForChannel'],
  },
  {
    args: makeArgs({key_index: undefined}),
    description: 'A key index is expected',
    error: [400, 'ExpectedMultiSigKeyIndexForFutureOpenChannel'],
  },
  {
    args: makeArgs({lnd: undefined}),
    description: 'LND is expected',
    error: [400, 'ExpectedAuthenticatedLndToPrepareForChannel'],
  },
  {
    args: makeArgs({remote_key: undefined}),
    description: 'A remote multi sig key is expected',
    error: [400, 'ExpectedRemoteMultiSigPublicKeyToChannelPrepare'],
  },
  {
    args: makeArgs({transaction_id: undefined}),
    description: 'A tx id is expected',
    error: [400, 'ExpectedFundingTransactionIdToPrepareForChannel'],
  },
  {
    args: makeArgs({transaction_vout: undefined}),
    description: 'A tx output index is expected',
    error: [400, 'ExpectedFundingTxOutputIndexToPrepareForChannel'],
  },
  {
    args: makeArgs({
      lnd: {
        default: {
          fundingStateStep: ({}, cbk) => cbk('err'),
        },
        wallet: {
          deriveKey: ({}, cbk) => cbk(null, {
            key_loc: {key_index: 0},
            raw_key_bytes: Buffer.alloc(1),
          }),
        },
      }
    }),
    description: 'Preparing errors are passed back',
    error: [503, 'UnexpectedErrorPreparingForChanPropose', {err: 'err'}],
  },
  {
    args: makeArgs({}),
    description: 'Preparing for channel',
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({deepEqual, end, equal, rejects}) => {
    if (!!error) {
      await rejects(() => prepareForChannelProposal(args), error, 'Got err');
    } else {
      const res = await prepareForChannelProposal(args);

      equal(res.id.length, 64, 'Got pending id');
    }

    return end();
  });
});
