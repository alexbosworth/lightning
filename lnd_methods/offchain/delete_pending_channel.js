const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');
const {Transaction} = require('bitcoinjs-lib');

const {fromHex} = Transaction;
const method = 'abandonChannel';
const methodUnsupported = 'AbandonChannel RPC call only available in dev builds';
const txIdAsHash = id => Buffer.from(id, 'hex').reverse();
const type = 'default';

/** Delete a pending channel

  Pass the confirmed conflicting transaction that spends the same input to
  make sure that no funds are being deleted.

  This method is not supported on LND 0.13.3 and below

  {
    confirmed_transaction: <Hex Encoded Conflicting Transaction String>
    lnd: <Authenticated LND API Object>
    pending_transaction: <Hex Encoded Pending Transaction String>
    pending_transaction_vout: <Pending Channel Output Index Number>
  }

  @returns via cbk or Promise
*/
module.exports = (args, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!args.confirmed_transaction) {
          return cbk([400, 'ExpectedConfirmedConflictingTxToDeleteChannel']);
        }

        try {
          fromHex(args.confirmed_transaction);
        } catch (err) {
          return cbk([400, 'ExpectedValidConfirmedTxToDeleteChannel']);
        }

        if (args.confirmed_transaction === args.pending_transaction) {
          return cbk([400, 'ExpectedConflictingTransactionToDeleteChannel']);
        }

        if (!args.lnd) {
          return cbk([400, 'ExpectedAuthenticatedLndToDeleteChannel']);
        }

        if (!args.pending_transaction) {
          return cbk([400, 'ExpectedPendingTransactionToDeleteChannel']);
        }

        try {
          fromHex(args.pending_transaction);
        } catch (err) {
          return cbk([400, 'ExpectedValidPendingTxToDeleteChannel']);
        }

        if (args.pending_transaction_vout === undefined) {
          return cbk([400, 'ExpectedPendingChannelTxVoutToDeleteChannel']);
        }

        return cbk();
      },

      // Check for a conflicting input between the confirmed and pending txs
      transactionId: ['validate', ({}, cbk) => {
        const confirmedInputs = fromHex(args.confirmed_transaction).ins;
        const pending = fromHex(args.pending_transaction);

        const conflictingInput = pending.ins.find(pendingInput => {
          return confirmedInputs.find(confirmedInput => {
            if (!confirmedInput.hash.equals(pendingInput.hash)) {
              return false;
            }

            return confirmedInput.index === pendingInput.index;
          });
        });

        if (!conflictingInput) {
          return cbk([400, 'FailedToFindConflictingInputInConfirmedTx']);
        }

        // The pending transaction conflicts with the confirmed transaction
        return cbk(null, pending.getId());
      }],

      // Delete the channel
      abandonChannel: ['transactionId', ({transactionId}, cbk) => {
        return args.lnd[type][method]({
          channel_point: {
            funding_txid_bytes: txIdAsHash(transactionId),
            output_index: args.pending_transaction_vout,
          },
          i_know_what_i_am_doing: true,
        },
        err => {
          if (!!err && err.details === methodUnsupported) {
            return cbk([501, 'DeletePendingChannelMethodNotSupported']);
          }

          if (!!err) {
            return cbk([503, 'UnexpectedErrorDeletingPendingChannel', {err}]);
          }

          return cbk();
        });
      }],
    },
    returnResult({reject, resolve}, cbk));
  });
};
