const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');
const {Transaction} = require('bitcoinjs-lib');

const getChainTransactions = require('./get_chain_transactions');
const {isLnd} = require('./../../lnd_requests');

const {fromHex} = Transaction;
const {isArray} = Array;
const method = 'listSweeps';
const notSupportedError = 'unknown service walletrpc.WalletKit';
const type = 'wallet';

/** Get self-transfer spend transactions related to channel closes

  Requires `onchain:read` permission

  Requires LND built with `walletrpc` build tag

  {
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk or Promise
  {
    transactions: [{
      [block_id]: <Block Hash String>
      [confirmation_count]: <Confirmation Count Number>
      [confirmation_height]: <Confirmation Block Height Number>
      created_at: <Created ISO 8601 Date String>
      [fee]: <Fees Paid Tokens Number>
      id: <Transaction Id String>
      is_confirmed: <Is Confirmed Bool>
      is_outgoing: <Transaction Outbound Bool>
      output_addresses: [<Address String>]
      spends: [{
        [tokens]: <Output Tokens Number>
        transaction_id: <Spend Transaction Id Hex String>
        transaction_vout: <Spend Transaction Output Index Number>
      }]
      tokens: <Tokens Including Fee Number>
      [transaction]: <Raw Transaction Hex String>
    }]
  }
*/
module.exports = ({lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedLndToGetSweepTransactions']);
        }

        return cbk();
      },

      // Get sweep transaction ids
      getSweeps: ['validate', ({}, cbk) => {
        return lnd[type][method]({}, (err, res) => {
          if (!!err && err.details === notSupportedError) {
            return cbk([501, 'BackingLndDoesNotSupportListingSweeps']);
          }

          if (!!err) {
            return cbk([503, 'UnexpectedGetSweepTxError', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedResponseForGetSweepTxRequest']);
          }

          if (!res.transaction_ids) {
            return cbk([503, 'ExpectedTransactionIdsInSweepTxResponse']);
          }

          if (!isArray(res.transaction_ids.transaction_ids)) {
            return cbk([503, 'ExpectedArrayOfTransactionIdsInSweepsResponse']);
          }

          return cbk(null, res.transaction_ids.transaction_ids);
        });
      }],

      // Get chain transactions for context adding
      getTransactions: ['validate', ({}, cbk) => {
        return getChainTransactions({lnd}, cbk);
      }],

      // Combine sweeps with transactions for context
      sweeps: [
        'getSweeps',
        'getTransactions',
        ({getSweeps, getTransactions}, cbk) =>
      {
        const transactions = getTransactions.transactions
          .filter(({id}) => getSweeps.includes(id))
          .filter(({transaction}) => !!transaction)
          .map(tx => {
            const {ins} = fromHex(tx.transaction);

            const spends = ins.map(input => {
              return {
                transaction_id: input.hash.reverse().toString('hex'),
                transaction_vout: input.index,
              };
            });

            const relatedUtxos = spends.map(spend => {
              const spending = getTransactions.transactions.find(({id}) => {
                return id === spend.transaction_id;
              });

              // Exit early when spending an unknown transaction
              if (!spending) {
                return {
                  transaction_id: spend.transaction_id,
                  transaction_vout: spend.transaction_vout,
                };
              }

              const parentTx = spending.transaction;

              const {value} = fromHex(parentTx).outs[spend.transaction_vout];

              return {
                tokens: value,
                transaction_id: spend.transaction_id,
                transaction_vout: spend.transaction_vout,
              };
            });

            return {
              block_id: tx.block_id,
              confirmation_count: tx.confirmation_count,
              confirmation_height: tx.confirmation_height,
              created_at: tx.created_at,
              description: tx.description,
              fee: tx.fee,
              id: tx.id,
              is_confirmed: tx.is_confirmed,
              is_outgoing: tx.is_outgoing,
              output_addresses: tx.output_addresses,
              spends: relatedUtxos,
              tokens: tx.tokens,
              transaction: tx.transaction,
            };
          });

        return cbk(null, {transactions});
      }],
    },
    returnResult({reject, resolve, of: 'sweeps'}, cbk));
  });
};
