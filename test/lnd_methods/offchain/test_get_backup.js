const {test} = require('@alexbosworth/tap');

const {getBackup} = require('./../../../');

const txId = Buffer.alloc(32).toString('hex');

const makeLnd = ({err, res}) => {
  const result = res === undefined ? {chan_backup: Buffer.alloc(1)} : res;

  return {default: {exportChannelBackup: ({}, cbk) => cbk(err, result)}};
};

const makeArgs = overrides => {
  const args = {
    lnd: makeLnd({}),
    transaction_id: txId,
    transaction_vout: 0,
  };

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const tests = [
  {
    args: makeArgs({lnd: undefined}),
    description: 'LND object is required',
    error: [400, 'ExpectedLndConnectionToGetChannelBackup'],
  },
  {
    args: makeArgs({transaction_id: undefined}),
    description: 'A funding transaction id is required',
    error: [400, 'ExpectedTxIdOfChannelToGetChannelBackup'],
  },
  {
    args: makeArgs({transaction_vout: undefined}),
    description: 'A funding transaction vout is required',
    error: [400, 'ExpectedTxOutputIndexToGetChannelBackup'],
  },
  {
    args: makeArgs({lnd: makeLnd({err: 'err'})}),
    description: 'An unexpected error is returned',
    error: [503, 'UnexpectedErrExportingBackupForChannel', {err: 'err'}],
  },
  {
    args: makeArgs({lnd: makeLnd({res: null})}),
    description: 'A result is expected to be returned',
    error: [503, 'ExpectedResultOfGetChannelBackupRequest'],
  },
  {
    args: makeArgs({lnd: makeLnd({res: {}})}),
    description: 'A chan backup result is expected to be returned',
    error: [503, 'UnexpectedResponseForChannelBackupRequest'],
  },
  {
    args: makeArgs({lnd: makeLnd({res: {chan_backup: Buffer.alloc(0)}})}),
    description: 'A non empty chan backup result is returned',
    error: [503, 'UnexpectedResponseForChannelBackupRequest'],
  },
  {
    args: makeArgs({}),
    description: 'A non empty chan backup result is returned',
    expected: {backup: '00'},
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({deepEqual, end, equal, rejects}) => {
    if (!!error) {
      await rejects(getBackup(args), error, 'Got expected error');
    } else {
      const {backup} = await getBackup(args);

      equal(backup, expected.backup, 'Got expected backup');
    }

    return end();
  });
});
