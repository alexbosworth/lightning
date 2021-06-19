const {test} = require('@alexbosworth/tap');

const {recoverFundsFromChannel} = require('./../../../');

const tests = [
  {
    args: {},
    description: 'A backup to verify is required',
    error: [400, 'ExpectedBackupWhenAttemptingChannelRestoration'],
  },
  {
    args: {backup: '00'},
    description: 'An authenticated LND object is required',
    error: [400, 'ExpectedLndToRestoreChannelFromBackup'],
  },
  {
    args: {
      backup: '00',
      lnd: {
        default: {
          restoreChannelBackups: ({}, cbk) => cbk(),
          verifyChanBackup: ({}, cbk) => cbk('err'),
        }
      },
    },
    description: 'Channel backup is invalid',
    error: [400, 'ProvidedBackupIsInvalid'],
  },
  {
    args: {
      backup: '00',
      lnd: {
        default: {
          restoreChannelBackups: ({}, cbk) => cbk({
            details: 'unable to unpack single backups: channel already exists',
          }),
          verifyChanBackup: ({}, cbk) => cbk(),
        },
      },
    },
    description: 'LND errors are passed back',
    error: [400, 'ChannelAlreadyExists'],
  },
  {
    args: {
      backup: '00',
      lnd: {
        default: {
          restoreChannelBackups: ({}, cbk) => cbk('err'),
          verifyChanBackup: ({}, cbk) => cbk(),
        },
      },
    },
    description: 'LND errors are passed back',
    error: [503, 'UnexpectedErrorRestoringChanFromBackup', {err: 'err'}],
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
    expected: {},
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, rejects, strictSame}) => {
    if (!!error) {
      await rejects(recoverFundsFromChannel(args), error, 'Got expected error');
    } else {
      const res = await recoverFundsFromChannel(args);

      strictSame(res, expected, 'Got expected result');
    }

    return end();
  });
});
