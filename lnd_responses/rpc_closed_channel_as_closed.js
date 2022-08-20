const {chanFormat} = require('bolt07');

const rpcResolutionAsResolution = require('./rpc_resolution_as_resolution');

const breachClose = 'BREACH_CLOSE';
const cooperativeClose = 'COOPERATIVE_CLOSE';
const emptyChanId = Number().toString();
const emptyTxId = Buffer.alloc(32).toString('hex');
const fundingCanceled = 'FUNDING_CANCELED';
const initiatorLocal = 'INITIATOR_LOCAL';
const initiatorRemote = 'INITIATOR_REMOTE';
const {isArray} = Array;
const local = 'LOCAL';
const localForceClose = 'LOCAL_FORCE_CLOSE';
const outpointSeparator = ':';
const remote = 'REMOTE';
const remoteForceClose = 'REMOTE_FORCE_CLOSE';

/** RPC closed local channel as close details

  {
    alias_scids: [<Channel Id Number String>]
    capacity: <Channel Capacity Tokens String>
    chan_id: <Numeric Format Channel Id String>
    channel_point: <Channel Funding Outpoint String>
    close_height: <Channel Close Height Number>
    [close_initiator]: <Channel Close Initiator String>
    [close_type]: <Channel Close Type String>
    closing_tx_hash: <Channel Closing Transaction Hex String>
    open_initiator: <Channel Open Initiator String>
    remote_pubkey: <Remote Node Public Key Hex String>
    resolutions: [{
      amount_sat: <Resolution Output Value Tokens String>
      outcome: <Resolution Outcome Type String>
      outpoint: {
        output_index: <Transaction Vout Number>
        txid_str: <Transaction Id Hex String>
      }
      resolution_type: <Resolution Type String>
      [sweep_txid]: <Spending Outpoint Transaction Id Hex String>
    }]
    settled_balance: <Channel Close Settle Balance Tokens String>
    time_locked_balance: <Channel Time Locked Balance Tokens String>
    zero_conf_confirmed_scid: <Trusted Channel Confirmed Id Number String>
  }

  @throws
  <Error>

  @returns
  {
    capacity: <Closed Channel Capacity Tokens Number>
    [close_balance_spent_by]: <Channel Balance Output Spent By Tx Id String>
    [close_balance_vout]: <Channel Balance Close Tx Output Index Number>
    [close_confirm_height]: <Channel Close Confirmation Height Number>
    close_payments: [{
      is_outgoing: <Payment Is Outgoing Bool>
      is_paid: <Payment Is Claimed With Preimage Bool>
      is_pending: <Payment Resolution Is Pending Bool>
      is_refunded: <Payment Timed Out And Went Back To Payer Bool>
      [spent_by]: <Close Transaction Spent By Transaction Id Hex String>
      tokens: <Associated Tokens Number>
      transaction_id: <Transaction Id Hex String>
      transaction_vout: <Transaction Output Index Number>
    }]
    [close_transaction_id]: <Closing Transaction Id Hex String>
    final_local_balance: <Channel Close Final Local Balance Tokens Number>
    final_time_locked_balance: <Closed Channel Timelocked Tokens Number>
    [id]: <Closed Standard Format Channel Id String>
    is_breach_close: <Is Breach Close Bool>
    is_cooperative_close: <Is Cooperative Close Bool>
    is_funding_cancel: <Is Funding Cancelled Close Bool>
    is_local_force_close: <Is Local Force Close Bool>
    [is_partner_closed]: <Channel Was Closed By Channel Peer Bool>
    [is_partner_initiated]: <Channel Was Initiated By Channel Peer Bool>
    is_remote_force_close: <Is Remote Force Close Bool>
    other_ids: [<Other Channel Id String>]
    partner_public_key: <Partner Public Key Hex String>
    transaction_id: <Channel Funding Transaction Id Hex String>
    transaction_vout: <Channel Funding Output Index Number>
  }
*/
module.exports = chan => {
  if (!chan) {
    throw new Error('ExpectedChannelCloseDetailsToDeriveClosedChannel');
  }

  if (!isArray(chan.alias_scids)) {
    throw new Error('ExpectedArrayOfAliasShortChannelIdsInClosedChannel');
  }

  if (!chan.capacity) {
    throw new Error('ExpectedCloseChannelCapacity');
  }

  if (!chan.chan_id) {
    throw new Error('ExpectedChannelIdOfClosedChannel');
  }

  if (!chan.channel_point) {
    throw new Error('ExpectedCloseChannelOutpoint');
  }

  if (chan.close_height === undefined) {
    throw new Error('ExpectedChannelCloseHeight');
  }

  if (!chan.closing_tx_hash) {
    throw new Error('ExpectedClosingTransactionId');
  }

  if (!chan.remote_pubkey) {
    throw new Error('ExpectedCloseRemotePublicKey');
  }

  if (!chan.settled_balance) {
    throw new Error('ExpectedFinalSettledBalance');
  }

  if (!chan.time_locked_balance) {
    throw new Error('ExpectedFinalTimeLockedBalanceForClosedChan');
  }

  const otherIds = chan.alias_scids
    .filter(n => n !== chan.zero_conf_confirmed_scid)
    .map(number => chanFormat({number}));

  const closer = chan.close_initiator;
  const finalTimeLock = Number(chan.time_locked_balance);
  const hasCloseTx = chan.closing_tx_hash !== emptyTxId;
  const hasId = chan.chan_id !== emptyChanId;
  const height = !chan.close_height ? undefined : chan.close_height;
  let isPartnerClosed;
  let isPartnerInitiated;
  const [txId, vout] = chan.channel_point.split(outpointSeparator);
  const zeroConfId = chan.zero_conf_confirmed_scid;

  const closeTxId = !hasCloseTx ? undefined : chan.closing_tx_hash;
  const isLocalCooperativeClose = closer === initiatorLocal;
  const isRemoteCooperativeClose = closer === initiatorRemote;
  const number = !!Number(zeroConfId) ? zeroConfId : chan.chan_id;

  const chanId = !hasId ? null : chanFormat({number});

  // Try and determine if the channel was opened by our peer
  if (chan.open_initiator === local) {
    isPartnerInitiated = false;
  } else if (chan.open_initiator === remote) {
    isPartnerInitiated = true;
  }

  // Try and determine if the channel was closed by our peer
  if (chan.close_initiator === local) {
    isPartnerClosed = false;
  } else if (chan.close_initiator === remote) {
    isPartnerClosed = true;
  }

  // Force close initiators are given
  if (chan.close_type === localForceClose) {
    isPartnerClosed = false
  } else if (chan.close_type === remoteForceClose) {
    isPartnerClosed = true;
  }

  const resolutions = (chan.resolutions || []).map(rpcResolutionAsResolution);

  const {balance} = resolutions.find(n => n.balance) || {balance: {}};
  const payments = resolutions.map(n => n.payment).filter(n => !!n);

  return {
    capacity: Number(chan.capacity),
    close_balance_spent_by: balance.spent_by,
    close_balance_vout: balance.transaction_vout,
    close_confirm_height: height,
    close_payments: payments,
    close_transaction_id: closeTxId,
    final_local_balance: Number(chan.settled_balance),
    final_time_locked_balance: finalTimeLock,
    id: !chanId ? undefined : chanId.channel,
    is_breach_close: chan.close_type === breachClose,
    is_cooperative_close: chan.close_type === cooperativeClose,
    is_funding_cancel: chan.close_type === fundingCanceled,
    is_local_force_close: chan.close_type === localForceClose,
    is_partner_closed: isPartnerClosed,
    is_partner_initiated: isPartnerInitiated,
    is_remote_force_close: chan.close_type === remoteForceClose,
    other_ids: otherIds.map(n => n.channel),
    partner_public_key: chan.remote_pubkey,
    transaction_id: txId,
    transaction_vout: Number(vout),
  };
};
