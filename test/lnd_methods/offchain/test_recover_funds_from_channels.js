const {test} = require('@alexbosworth/tap');

const {recoverFundsFromChannels} = require('./../../../');

const tests = [
  {
    args: {},
    description: 'A backup to verify is required',
    error: [400, 'ExpectedBackupWhenAttemptingRestoreChannelFunds'],
  },
  {
    args: {backup: '00'},
    description: 'An authenticated LND object is required',
    error: [400, 'ExpectedLndWhenAttemptingToRestoreChannelFunds'],
  },
  {
    args: {
      backup: '00',
      lnd: {default: {restoreChannelBackups: ({}, cbk) => cbk('err')}},
    },
    description: 'LND errors are passed back',
    error: [503, 'UnexpectedErrWhenRestoringChannelFunds', {err: 'err'}],
  },
  {
    args: {
      backup: '00',
      lnd: {
        default: {
          restoreChannelBackups: ({}, cbk) => cbk(),
          verifyChanBackup: ({}, cbk) => cbk(),
        },
      },
    },
    description: 'Funds are recovered',
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, rejects, strictSame}) => {
    if (!!error) {
      await rejects(recoverFundsFromChannels(args), error, 'Got error');
    } else {
      const res = await recoverFundsFromChannels(args);

      strictSame(res, expected, 'Got expected result');
    }

    return end();
  });
});
