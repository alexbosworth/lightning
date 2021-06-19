const {test} = require('@alexbosworth/tap');

const {verifyBackups} = require('./../../../');

const tests = [
  {
    args: {},
    description: 'A backup to verify is required',
    error: [400, 'ExpectedMultiChannelBackupToVerify'],
  },
  {
    args: {backup: '00'},
    description: 'Channels to verify are required',
    error: [400, 'ExpectedChannelsToVerifyInMultiBackup'],
  },
  {
    args: {
      backup: '00',
      channels: [{
        transaction_id: Buffer.alloc(32).toString('hex'),
        transaction_vout: 0,
      }],
    },
    description: 'An authenticated LND object is required',
    error: [400, 'ExpectedAuthenticatedLndToVerifyChanBackup'],
  },
  {
    args: {
      backup: '00',
      channels: [{transaction_vout: 0}],
      lnd: {default: {verifyChanBackup: ({}, cbk) => cbk('err')}},
    },
    description: 'Channel id is required',
    error: [400, 'ExpectedChannelOutpointsToVerifyBackups'],
  },
  {
    args: {
      backup: '00',
      channels: [{transaction_id: Buffer.alloc(32).toString('hex')}],
      lnd: {default: {verifyChanBackup: ({}, cbk) => cbk('err')}},
    },
    description: 'Channel vout is required',
    error: [400, 'ExpectedChannelOutpointsToVerifyBackups'],
  },
  {
    args: {
      backup: '00',
      channels: [{
        transaction_id: Buffer.alloc(32).toString('hex'),
        transaction_vout: 0,
      }],
      lnd: {default: {verifyChanBackup: ({}, cbk) => cbk('err')}},
    },
    description: 'Channel backup is invalid',
    expected: {is_valid: false},
  },
  {
    args: {
      backup: '00',
      channels: [{
        transaction_id: Buffer.alloc(32).toString('hex'),
        transaction_vout: 0,
      }],
      lnd: {default: {verifyChanBackup: ({}, cbk) => cbk()}},
    },
    description: 'Channel backup is valid',
    expected: {is_valid: true},
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, rejects, strictSame}) => {
    if (!!error) {
      await rejects(verifyBackups(args), error, 'Got expected error');
    } else {
      const res = await verifyBackups(args);

      strictSame(res, expected, 'Got expected result');
    }

    return end();
  });
});
