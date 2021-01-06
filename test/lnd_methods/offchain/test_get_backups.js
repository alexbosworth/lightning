const {test} = require('tap');

const {getBackups} = require('./../../../lnd_methods');

const tests = [
  {
    args: {},
    description: 'LND object is required',
    error: [400, 'ExpectedLndGrpcToExportAllChannelBackups'],
  },
  {
    args: {
      lnd: {default: {exportAllChannelBackups: ({}, cbk) => cbk('err')}},
    },
    description: 'An unexpected error is returned',
    error: [503, 'UnexpectedErrorGettingAllChanBackups', {err: 'err'}],
  },
  {
    args: {lnd: {default: {exportAllChannelBackups: ({}, cbk) => cbk()}}},
    description: 'A response is expected',
    error: [503, 'ExpectedChanBackupsResponseForBackupsRequest'],
  },
  {
    args: {
      lnd: {
        default: {
          exportAllChannelBackups: ({}, cbk) => cbk(null, {
            single_chan_backups: {
              chan_backups: [{
                chan_backup: Buffer.alloc(1),
                chan_point: {
                  funding_txid_bytes: Buffer.alloc(32),
                  output_index: 0,
                },
              }],
            },
            multi_chan_backup: {
              chan_points: [{
                funding_txid_bytes: Buffer.alloc(32),
                output_index: 0,
              }],
              multi_chan_backup: Buffer.alloc(1),
            },
          }),
        },
      },
    },
    description: 'Backups are exported',
    expected: {
      backup: Buffer.alloc(1).toString('hex'),
      channels: [{
        backup: Buffer.alloc(1).toString('hex'),
        transaction_id: Buffer.alloc(32).toString('hex'),
        transaction_vout: 0,
      }],
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({deepEqual, end, equal, rejects}) => {
    if (!!error) {
      await rejects(getBackups(args), error, 'Got expected error');
    } else {
      const details = await getBackups(args);

      deepEqual(details, expected, 'Got expected details');
    }

    return end();
  });
});
