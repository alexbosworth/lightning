const {abs} = Math;
const {isArray} = Array;
const isBool = n => n === false || n === true;
const isHash = n => !!n && /^[0-9A-F]{64}$/i.test(n);
const isNumber = n => !!n && !isNaN(n);
const msPerSec = 1e3;
const notFound = -1;
const nullHash = '0000000000000000000000000000000000000000000000000000000000000000';
const outpointAsComponents = n => n.split(':');

/** Transaction from RPC transaction message

  {
    amount: <Tokens String>
    block_hash: <Included In Block Hash Hex String>
    block_height: <Block Hash In Best Chain At Block Height Number>
    dest_addresses: [<Output Address String>]
    label: <Label String>
    num_confirmations: <Confirmation Count Number>
    previous_outpoints: [{
      is_our_output: <Is Local Output Bool>
      outpoint: <Outpoint String>
    }]
    raw_tx_hex: <Raw Transaction Serialized Hex String>
    time_stamp: <Transaction Created At Epoch Time String>
    total_fees: <Total Fees Paid Related To This Transaction String>
    tx_hash: <Transaction Id Hex String>
  }

  @throws
  <Error>

  @returns
  {
    [block_id]: <Block Hash String>
    [confirmation_count]: <Confirmation Count Number>
    [confirmation_height]: <Confirmation Block Height Number>
    created_at: <Created ISO 8601 Date String>
    [description]: <Transaction Label String>
    [fee]: <Fees Paid Tokens Number>
    id: <Transaction Id String>
    inputs: [{
      is_local: <Spent Outpoint is Local Bool>
      transaction_id: <Transaction Id Hex String>
      transaction_vout: <Transaction Output Index Number>
    }]
    is_confirmed: <Is Confirmed Bool>
    is_outgoing: <Transaction Outbound Bool>
    output_addresses: [<Address String>]
    tokens: <Tokens Including Fee Number>
    [transaction]: <Raw Transaction Hex String>
  }
*/
module.exports = tx => {
  if (!tx) {
    throw new Error('ExpectedRpcTransactionToDeriveTransactionDetails');
  }

  if (!tx.amount) {
    throw new Error('ExpectedTransactionAmountInChainTransaction');
  }

  if (tx.block_hash !== String() && !isHash(tx.block_hash)) {
    throw new Error('ExpectedTransactionBlockHashInChainTx');
  }

  if (tx.block_height === undefined) {
    throw new Error('ExpectedChainTransactionBlockHeightNumber');
  }

  if (!isArray(tx.dest_addresses)) {
    throw new Error('ExpectedChainTransactionDestinationAddresses');
  }

  if (tx.dest_addresses.findIndex(n => !n) !== notFound) {
    throw new Error('ExpectedDestinationAddressesInChainTx');
  }

  if (tx.num_confirmations === undefined) {
    throw new Error('ExpectedChainTransactionConfirmationsCount');
  }

  if (!isArray(tx.previous_outpoints)) {
    throw new Error('ExpectedArrayOfPreviousOutpointsInRpcTransaction');
  }

  if (!tx.time_stamp) {
    throw new Error('ExpectedChainTransactionTimestamp');
  }

  if (!tx.total_fees) {
    throw new Error('ExpectedChainTransactionTotalFees');
  }

  if (!isHash(tx.tx_hash)) {
    throw new Error('ExpectedChainTransactionId');
  }

  const inputs = tx.previous_outpoints.map(spend => {
    if (!spend.outpoint) {
      throw new Error('ExpectedPreviousOutpointInRpcTransaction');
    }

    const [id, vout] = outpointAsComponents(spend.outpoint);

    if (!isHash(id)) {
      throw new Error('ExpectedOutpointSpendingTransactionIdInRpcTx');
    }

    // Exit early when spend is empty
    if (id === nullHash) {
      return null;
    }

    if (!isNumber(vout)) {
      throw new Error('ExpectedOutpointSpendingTransactionVoutInRpcTx');
    }

    if (!isBool(spend.is_our_output)) {
      throw new Error('ExpectedOutpointOwnershipBooleanInRpcTransaction');
    }

    return {
      is_local: spend.is_our_output,
      transaction_id: id,
      transaction_vout: Number(vout),
    };
  });

  return {
    block_id: tx.block_hash || undefined,
    confirmation_count: tx.num_confirmations || undefined,
    confirmation_height: tx.block_height || undefined,
    created_at: new Date(Number(tx.time_stamp) * msPerSec).toISOString(),
    description: tx.label || undefined,
    fee: Number(tx.total_fees) || undefined,
    id: tx.tx_hash,
    inputs: inputs.filter(n => !!n),
    is_confirmed: !!tx.num_confirmations,
    is_outgoing: Number(tx.amount) < Number(),
    output_addresses: tx.dest_addresses,
    tokens: abs(Number(tx.amount)),
    transaction: tx.raw_tx_hex || undefined,
  };
};
