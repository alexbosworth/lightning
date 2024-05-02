const isBoolean = n => n === false || n === true;
const isHash = n => !!n && /^[0-9A-F]{64}$/i.test(n);
const isNumber = n => !isNaN(n);

/** Convert an RPC sweep into a sweep

  {
    amount_sat: <Outpoint Value Tokens Number>
    broadcast_attempts: <Count of Past Sweep Broadcasts Number>
    budget: <Maximum Fee Tokens to Spend On Sweeping String>
    deadline_height: <Maximum Confirmation Height Number>
    immediate: <Sweep Was Specified To Skip Waiting For Batching Bool>
    outpoint: {
      output_index: <Transaction Output Index Number>
      txid_str: <Transaction Id Hex String>
    }
    requested_sat_per_vbyte: <Requested Chain Fee Rate Tokens Per VByte String>
    sat_per_vbyte: <Current Sweeping Chain Fee Rate Tokens Per VByte String>
    witness_type: <Witness Type String>
  }

  @throws
  <Error>

  @returns
  {
    broadcasts_count: <Total Sweep Broadcast Attempts Count Number>
    [current_fee_rate]: <Current Chain Fee Rate Tokens Per VByte Number>
    [initial_fee_rate]: <Requested Chain Fee Rate Tokens per VByte Number>
    is_batching: <Requested Waiting For Batching Bool>
    [max_fee]: <Maximum Total Fee Tokens Allowed Number>
    [max_height]: <Targeted Maximum Confirmation Height Number>
    tokens: <Sweep Outpoint Tokens Value Number>
    transaction_id: <Sweeping Outpoint Transaction Id Hex String>
    transaction_vout: <Sweeping Outpoint Transaction Output Index Number>
    type: <Outpoint Constraint Script Type String>
  }
*/
module.exports = args => {
  if (!args) {
    throw new Error('ExpectedSweepDetailsToDerivePendingSweep');
  }

  if (args.amount_sat === undefined) {
    throw new Error('ExpectedSweepOutpointValueAmountInPendingSweep');
  }

  if (!isNumber(args.broadcast_attempts)) {
    throw new Error('ExpectedBroadcastAttemptsForSweepInPendingSweep');
  }

  if (!args.budget) {
    throw new Error('ExpectedSweepBudgetAmountForSweepInPendingSweeps');
  }

  if (!isNumber(args.deadline_height)) {
    throw new Error('ExpectedSweepConfirmationDeadlineHeightInPendingSweep');
  }

  if (!isBoolean(args.immediate)) {
    throw new Error('ExpectedImmediateStatusOfSweepInPendingSweeps');
  }

  if (!args.outpoint) {
    throw new Error('ExpectedUnspentOutpointOfSweepInPendingSweeps');
  }

  if (!isNumber(args.outpoint.output_index)) {
    throw new Error('ExpectedOutputIndexOfSweepInPendingSweeps');
  }

  if (!isHash(args.outpoint.txid_str)) {
    throw new Error('ExpectedOutpointTransactionIdHexStringInSweep');
  }

  if (!args.requested_sat_per_vbyte) {
    throw new Error('ExpectedRequestedSatPerVByteForSweepInPendingSweeps');
  }

  if (!args.sat_per_vbyte) {
    throw new Error('ExpectedSatPerVByteForSweepInPendingSweeps');
  }

  return {
    broadcasts_count: args.broadcast_attempts,
    current_fee_rate: Number(args.sat_per_vbyte) || undefined,
    initial_fee_rate: Number(args.requested_sat_per_vbyte) || undefined,
    is_batching: !args.immediate,
    max_fee: Number(args.budget) || undefined,
    max_height: args.deadline_height || undefined,
    tokens: args.amount_sat,
    transaction_id: args.outpoint.txid_str,
    transaction_vout: args.outpoint.output_index,
    type: args.witness_type.toLowerCase(),
  };
};
