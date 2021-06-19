const {test} = require('@alexbosworth/tap');

const {backupsFromSnapshot} = require('./../../lnd_responses');

const multiChanBackup = {
  chan_points: [{funding_txid_bytes: Buffer.alloc(32), output_index: 2}],
  multi_chan_backup: Buffer.from('03', 'hex'),
};

const singleChanBackups = {
  chan_backups: [{
    chan_backup: Buffer.from('00', 'hex'),
    chan_point: {funding_txid_bytes: Buffer.alloc(32), output_index: 2},
  }],
};

const makeArgs = overrides => {
  const args = {
    multi_chan_backup: multiChanBackup,
    single_chan_backups: singleChanBackups,
  };

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const tests = [
  {
    args: makeArgs({}),
    description: 'Backups snapshot converts to backups',
    expected: {
      backup: '03',
      channels: [{
        backup: '00',
        transaction_id: Buffer.alloc(32).toString('hex'),
        transaction_vout: 2,
      }],
    },
  },
  {
    args: makeArgs({single_chan_backups: undefined}),
    description: 'Backups missing single channel backups',
    error: 'ExpectedChannelBackupsInBackupsResponse',
  },
  {
    args: makeArgs({single_chan_backups: {}}),
    description: 'Backups missing single channel backups array',
    error: 'ExpectedChannelBackupsInBackupsResponse',
  },
  {
    args: makeArgs({multi_chan_backup: undefined}),
    description: 'Backups missing multiple channel backups',
    error: 'ExpectedMultiChannelBackupInSnapshot',
  },
  {
    args: makeArgs({
      multi_chan_backup: {
        chan_points: [{}],
        multi_chan_backup: Buffer.from('03', 'hex'),
      },
    }),
    description: 'Multi backups must contain a tx id in chan points',
    error: 'ExpectedOutpointTxIdInSnapshotMultiBackup',
  },
  {
    args: makeArgs({
      multi_chan_backup: {
        chan_points: [{funding_txid_bytes: Buffer.from('01', 'hex')}],
        multi_chan_backup: Buffer.from('03', 'hex'),
      },
    }),
    description: 'Multi backups must contain a vout in chan points',
    error: 'ExpectedOutpointVoutInSnapshotMultiBackup',
  },
  {
    args: makeArgs({
      multi_chan_backup: {
        chan_points: [null],
        multi_chan_backup: Buffer.from('03', 'hex'),
      },
    }),
    description: 'Multi chan backup chan points must be objects',
    error: 'ExpectedOutpointInSnapshotMultiBackup',
  },
  {
    args: makeArgs({
      multi_chan_backup: {multi_chan_backup: Buffer.from('03', 'hex')},
    }),
    description: 'Multi chan backups must have array of channel points',
    error: 'ExpectedChannelPointsInBackupSnapshot',
  },
  {
    args: makeArgs({
      single_chan_backups: {chan_backups: [{chan_backup: '00'}]},
    }),
    description: 'Single chan backups must be buffers',
    error: 'ExpectedChannelBackupBufferFromSnapshot',
  },
  {
    args: makeArgs({
      single_chan_backups: {
        chan_backups: [{
          chan_backup: Buffer.from('00', 'hex'),
          chan_point: {funding_txid_bytes: Buffer.from('01', 'hex')},
        }],
      },
    }),
    description: 'Single chan backup chan points must have vouts',
    error: 'ExpectedSnapshotChannelFundingOutputIndex',
  },
  {
    args: makeArgs({
      single_chan_backups: {
        chan_backups: [{
          chan_backup: Buffer.from('00', 'hex'),
          chan_point: {},
        }],
      },
    }),
    description: 'Single chan backup chan points must have tx ids',
    error: 'ExpectedSnapshotChannelPointTransactionId',
  },
  {
    args: makeArgs({
      single_chan_backups: {
        chan_backups: [{chan_backup: Buffer.from('00', 'hex')}],
      },
    }),
    description: 'Single chan backup must have a channel funding outpoint',
    error: 'ExpectedBackupChanPointInSnapshot',
  },
  {
    args: makeArgs({single_chan_backups: {chan_backups: [null]}}),
    description: 'Single chan backups must not be null',
    error: 'ExpectedBackupChannelBackupInSnapshot',
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, ({end, equal, strictSame, throws}) => {
    if (!!error) {
      throws(() => backupsFromSnapshot(args), new Error(error), 'Got error');
    } else {
      const res = backupsFromSnapshot(args);

      strictSame(res, expected, 'Got expected result');
    }

    return end();
  });
});
