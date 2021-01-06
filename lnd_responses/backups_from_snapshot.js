const bufferAsHex = buffer => buffer.toString('hex');
const hexTxIdFromTxHash = hash => hash.reverse().toString('hex');
const {isArray} = Array;
const {isBuffer} = Buffer;

/** Backups from snapshot API response

  {
    single_chan_backups: {
      chan_backups: [{
        chan_backup: <Static Channel Backup Buffer Object>
        chan_point: {
          funding_txid_bytes: <Transaction Hash Buffer Object>
          output_index: <Transaction Output Index Number>
        }
      }]
    }
    multi_chan_backup: {
      chan_points: [{
        funding_txid_bytes: <Transaction Hash Buffer Object>
        output_index: <Transaction Output Index Number>
      }]
      multi_chan_backup: <Backup Buffer Object>
    }
  }

  @throws
  <Error>

  @returns
  {
    backup: <Multiple Backup Hex String>
    channels: [{
      backup: <Backup Hex String>
      transaction_id: <Transaction Id Hex String>
      transaction_vout: <Transaction Output Index Number>
    }]
  }
*/
module.exports = args => {
  if (!args.multi_chan_backup) {
    throw new Error('ExpectedMultiChannelBackupInSnapshot');
  }

  if (!isArray(args.multi_chan_backup.chan_points)) {
    throw new Error('ExpectedChannelPointsInBackupSnapshot');
  }

  args.multi_chan_backup.chan_points.forEach(outpoint => {
    if (!outpoint) {
      throw new Error('ExpectedOutpointInSnapshotMultiBackup');
    }

    if (!isBuffer(outpoint.funding_txid_bytes)) {
      throw new Error('ExpectedOutpointTxIdInSnapshotMultiBackup');
    }

    if (outpoint.output_index === undefined) {
      throw new Error('ExpectedOutpointVoutInSnapshotMultiBackup');
    }

    return;
  });

  if (!args.single_chan_backups) {
    throw new Error('ExpectedChannelBackupsInBackupsResponse');
  }

  if (!isArray(args.single_chan_backups.chan_backups)) {
    throw new Error('ExpectedChannelBackupsInBackupsResponse');
  }

  // Check that channel backups are as expected
  args.single_chan_backups.chan_backups.forEach(backup => {
    if (!backup) {
      throw new Error('ExpectedBackupChannelBackupInSnapshot');
    }

    if (!isBuffer(backup.chan_backup)) {
      throw new Error('ExpectedChannelBackupBufferFromSnapshot');
    }

    if (!backup.chan_point) {
      throw new Error('ExpectedBackupChanPointInSnapshot');
    }

    if (!isBuffer(backup.chan_point.funding_txid_bytes)) {
      throw new Error('ExpectedSnapshotChannelPointTransactionId');
    }

    if (backup.chan_point.output_index === undefined) {
      throw new Error('ExpectedSnapshotChannelFundingOutputIndex');
    }

    return;
  });

  return {
    backup: bufferAsHex(args.multi_chan_backup.multi_chan_backup),
    channels: args.single_chan_backups.chan_backups.map(backup => ({
      backup: bufferAsHex(backup.chan_backup),
      transaction_id: hexTxIdFromTxHash(backup.chan_point.funding_txid_bytes),
      transaction_vout: backup.chan_point.output_index,
    })),
  };
};
