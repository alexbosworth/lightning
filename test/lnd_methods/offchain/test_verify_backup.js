const {deepStrictEqual} = require('node:assert').strict;
const {rejects} = require('node:assert').strict;
const test = require('node:test');

const {verifyBackup} = require('./../../../');

const tests = [
  {
    args: {},
    description: 'A backup to verify is required',
    error: [400, 'ExpectedChannelBackupToVerify'],
  },
  {
    args: {backup: '00'},
    description: 'An authenticated LND object is required',
    error: [400, 'ExpectedLndToVerifyChannelBackup'],
  },
  {
    args: {
      backup: '00',
      lnd: {default: {verifyChanBackup: ({}, cbk) => cbk('err')}},
    },
    description: 'Channel backup is invalid',
    expected: {err: 'err', is_valid: false},
  },
  {
    args: {
      backup: '00',
      lnd: {default: {verifyChanBackup: ({}, cbk) => cbk()}},
    },
    description: 'Channel backup is valid',
    expected: {is_valid: true},
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async () => {
    if (!!error) {
      await rejects(verifyBackup(args), error, 'Got expected error');
    } else {
      const res = await verifyBackup(args);

      deepStrictEqual(res, expected, 'Got expected result');
    }

    return;
  });
});
