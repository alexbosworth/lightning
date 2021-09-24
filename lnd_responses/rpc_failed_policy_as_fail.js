const {policyUpdateFailures} = require('./constants');

const internalByteOrderTxIdAsTxId = n => n.slice().reverse().toString('hex');
const {isBuffer} = Buffer;

/** Interpret a failed routing policy update as a failure

  {
    outpoint: {
      txid_bytes: <Internal Byte Order Transaction Id Buffer Object>
      output_index: <Transaction Output Index Number>
    }
    reason: <Failure Type String>
    update_error: <Failure Description String>
  }

  @throws
  <Error>

  @returns
  {
    failure: <Failure Reason String>
    is_pending_channel: <Referenced Channel Is Still Pending Bool>
    is_unknown_channel: <Referenced Channel is Unknown Bool>
    is_invalid_policy: <Policy Arguments Are Invalid Bool>
    transaction_id: <Funding Transaction Id Hex String>
    transaction_vout: <Funding Transaction Output Index Number>
  }
*/
module.exports = args => {
  if (!args) {
    throw new Error('ExpectedPolicyFailureToDeriveFailureDetails');
  }

  if (!args.outpoint) {
    throw new Error('ExpectedFundingTransactionOutpointForPolicyFailDetails');
  }

  if (!isBuffer(args.outpoint.txid_bytes)) {
    throw new Error('ExpectedFundingTxIdBytesForPolicyFailDetails');
  }

  if (args.outpoint.output_index === undefined) {
    throw new Error('ExpectedFundingTxOutputIndexForPolicyFailDetails');
  }

  return {
    failure: args.update_error,
    is_pending_channel: args.reason === policyUpdateFailures.pending_channel,
    is_unknown_channel: args.reason === policyUpdateFailures.unknown_channel,
    is_invalid_policy: args.reason === policyUpdateFailures.invalid_policy,
    transaction_id: internalByteOrderTxIdAsTxId(args.outpoint.txid_bytes),
    transaction_vout: args.outpoint.output_index,
  };
};
