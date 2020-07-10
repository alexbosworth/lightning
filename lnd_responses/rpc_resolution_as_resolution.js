const {resolutionOutcomes} = require('./constants');
const {resolutionTypes} = require('./constants');

const isHash = n => !!n && /^[0-9A-F]{64}$/i.test(n);
const outpointSeparator = ':';

/** Map RPC resolution to channel resolution

  {
    amount_sat: <Resolution Output Value Tokens String>
    outcome: <Resolution Outcome Type String>
    outpoint: {
      output_index: <Transaction Vout Number>
      txid_str: <Transaction Id Hex String>
    }
    resolution_type: <Resolution Type String>
    [sweep_txid]: <Spending Outpoint Transaction Id Hex String>
  }

  @throws
  <Error>

  @returns
  {
    [balance]: {
      spent_by: <Close Transaction Spent By Transaction Id Hex String>
      transaction_vout: <Balance Spent By Transaction Output Index Number>
    }
    [payment]: {
      is_outgoing: <Payment Is Outgoing Bool>
      is_paid: <Payment Is Claimed With Preimage Bool>
      is_pending: <Payment Resolution Is Pending Bool>
      is_refunded: <Payment Timed Out And Went Back To Payer Bool>
      [spent_by]: <Close Transaction Spent By Transaction Id Hex String>
      tokens: <Associated Tokens Number>
      transaction_id: <Transaction Id Hex String>
      transaction_vout: <Transaction Output Index Number>
    }
  }
*/
module.exports = args => {
  if (!args) {
    throw new Error('ExpectedRpcResolutionMessageToDeriveResolution');
  }

  if (!args.amount_sat) {
    throw new Error('ExpectedAmountSpentToInRpcResolutionMessage');
  }

  if (!args.outcome) {
    throw new Error('ExpectedResolutionOutcomeInRpcResolutionMessage');
  }

  if (!args.outpoint) {
    throw new Error('ExpectedResolutionOutpointInRpcResolutionMessage');
  }

  if (args.outpoint.output_index === undefined) {
    throw new Error('ExpectedResolutionOutpointVoutInRpcResolutionMessage');
  }

  if (!isHash(args.outpoint.txid_str)) {
    throw new Error('ExpectedResolutionOutpointTxIdInRpcResolutionMessage');
  }

  if (!args.resolution_type) {
    throw new Error('ExpectedResolutionTypeInRpcResolutionMessage');
  }

  if (!!args.sweep_txid && !isHash(args.sweep_txid)) {
    throw new Error('ExpectedSweepTransactionIdInRpcResolutionMessage');
  }

  switch (args.resolution_type) {
  case resolutionTypes.balance:
    // Exit early when the outcome is indeterminate
    if (!args.sweep_txid || args.outcome !== resolutionOutcomes.confirmed) {
      return {};
    }

    return {
      balance: {
        spent_by: args.sweep_txid,
        transaction_vout: args.outpoint.output_index,
      },
    };

  case resolutionTypes.incoming_payment:
  case resolutionTypes.outgoing_payment:
    return {
      payment: {
        is_outgoing: args.resolution_type === resolutionTypes.outgoing_payment,
        is_paid: args.outcome === resolutionOutcomes.confirmed,
        is_pending: args.outcome === resolutionOutcomes.pending,
        is_refunded: args.outcome === resolutionOutcomes.refunded,
        spent_by: args.sweep_txid || undefined,
        tokens: Number(args.amount_sat),
        transaction_id: args.outpoint.txid_str,
        transaction_vout: args.outpoint.output_index,
      },
    };

  default:
    return {};
  }
};
