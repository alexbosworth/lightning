const {chanFormat} = require('bolt07');

const bufferAsHex = buffer => buffer.toString('hex');
const emptyTxId = Buffer.alloc(32);
const {isBuffer} = Buffer;

/** Map RPC graph channel closed to a channel close update

  {
    [capacity]: <Channel Capacity Tokens String>
    chan_id: <Numeric Format Channel Id String>
    chan_point: {
      funding_txid_bytes: <Funding Internal Byte Order Tx Id Buffer Object>
      output_index: <Output Index Number>
    }
    closed_height: <Channel Closed At Height Number>
  }

  @throws
  <Error>

  @returns
  {
    [capacity]: <Channel Capacity Tokens Number>
    close_height: <Channel Close Confirmed Block Height Number>
    id: <Standard Format Channel Id String>
    [transaction_id]: <Channel Transaction Id String>
    [transaction_vout]: <Channel Transaction Output Index Number>
    updated_at: <Update Received At ISO 8601 Date String>
  }
*/
module.exports = update => {
  if (!update) {
    throw new Error('ExpectedChannelClosedUpdateDetails');
  }

  if (!update.capacity) {
    throw new Error('ExpectedChanCapacity');
  }

  if (!update.chan_id) {
    throw new Error('ExpectedChannelId');
  }

  try {
    chanFormat({number: update.chan_id});
  } catch (err) {
    throw new Error('ExpectedValidChannelId');
  }

  if (!update.chan_point) {
    throw new Error('ExpectedChanOutpoint');
  }

  if (!isBuffer(update.chan_point.funding_txid_bytes)) {
    throw new Error('ExpectedChannelTxId');
  }

  if (update.chan_point.output_index === undefined) {
    throw new Error('ExpectedChanPointVout');
  }

  if (!update.closed_height) {
    throw new Error('ExpectedCloseHeight');
  }

  const transactionId = update.chan_point.funding_txid_bytes.reverse();

  const txId = !!transactionId.equals(emptyTxId) ? null : transactionId;

  return {
    capacity: Number(update.capacity) || undefined,
    close_height: update.closed_height,
    id: chanFormat({number: update.chan_id}).channel,
    transaction_id: !!txId ? bufferAsHex(txId) : undefined,
    transaction_vout: !!txId ? update.chan_point.output_index : undefined,
    updated_at: new Date().toISOString(),
  };
};
