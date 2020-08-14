const bufferAsHex = buffer => buffer.toString('hex');
const {isBuffer} = Buffer;

/** Map an outpoint event to an update

  {
    [funding_txid_bytes]: <Internal Byte Order Tx Id Buffer Object>
    output_index: <Channel Output Index Number>
    [txid]: <Internal Byte Order Tx Id Buffer Object>
  }

  @throws
  <Error>

  @returns
  {
    transaction_id: <Transaction Id Hex String>
    transaction_vout: <Transaction Output Index Number>
  }
*/
module.exports = update => {
  if (!update) {
    throw new Error('ExpectedUpdateDetailsForRpcOutpointUpdate');
  }

  const transactionId = update.txid || update.funding_txid_bytes;

  if (!isBuffer(transactionId)) {
    throw new Error('ExpectedTransactionIdBufferForRpcOutpoint');
  }

  if (update.output_index === undefined) {
    throw new Error('ExpectedOutputIndexForRpcOutpoint');
  }

  return {
    transaction_id: bufferAsHex(transactionId.reverse()),
    transaction_vout: update.output_index,
  };
};
