const bufferAsHex = buffer => buffer.toString('hex');
const {isBuffer} = Buffer;
const typeConfirmation = 'confirmation';
const typeReorg = 'reorg';

/** Map an RPC spend message to a spend confirmation event

  {
    [reorg]: {}
    [spend]: {
      raw_spending_tx: <Raw Spending Transaction Bytes Buffer Object>
      spending_height: <Spending Block Height Number>
      spending_input_index: <Spending Transaction Input Index Number>
    }
  }

  @throws
  <Error>

  @returns
  {
    [data]: {
      height: <Confirmation Block Height Number>
      transaction: <Raw Transaction Hex String>
      vin: <Spend Outpoint Index Number>
    }
    type: <Event Type String>
  }
*/
module.exports = args => {
  if (!args) {
    throw new Error('ExpectedSpendConfEvent');
  }

  // Exit early when there is a reorg
  if (!!args.reorg) {
    return {type: typeReorg};
  }

  if (!args.spend) {
    throw new Error('ExpectedSpendTxReorgEvent');
  }

  if (!isBuffer(args.spend.raw_spending_tx)) {
    throw new Error('ExpectedRawTxInSpendConf');
  }

  if (args.spend.spending_height === undefined) {
    throw new Error('ExpectedHeightInSpendConf');
  }

  if (args.spend.spending_input_index === undefined) {
    throw new Error('ExpectedVinInSpendConf');
  }

  return {
    type: typeConfirmation,
    data: {
      height: args.spend.spending_height,
      transaction: bufferAsHex(args.spend.raw_spending_tx),
      vin: args.spend.spending_input_index,
    },
  };
};
