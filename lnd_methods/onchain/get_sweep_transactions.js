const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');
const {rpcTxAsTransaction} = require('./../../lnd_responses');

const {isArray} = Array;
const method = 'listSweeps';
const notSupportedError = 'unknown service walletrpc.WalletKit';
const type = 'wallet';

/** Get timelocked spend transactions related to channel closes

  Requires `onchain:read` permission

  This method is not suppoorted on LND 0.10.0 and below

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

      // Get sweep transactions
      getSweeps: ['validate', ({}, cbk) => {
        return lnd[type][method]({verbose: true}, (err, res) => {
          if (!!err && err.details === notSupportedError) {
            return cbk([501, 'BackingLndDoesNotSupportListingSweeps']);
          }

          if (!!err) {
            return cbk([503, 'UnexpectedGetSweepTxError', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedResponseForGetSweepTxRequest']);
          }

          if (!res.transaction_details) {
            return cbk([503, 'ExpectedTransactionDetailsInGetSweepsResponse']);
          }

          if (!isArray(res.transaction_details.transactions)) {
            return cbk([503, 'ExpectedArrayOfTransactioonsInSweepsResponse']);
          }

          const transactionDetails = res.transaction_details;

          try {
            const transactions = transactionDetails.transactions.map(tx => {
              return rpcTxAsTransaction(tx);
            });

            return cbk(null, {transactions});
          } catch (err) {
            return cbk([503, err.message]);
          }
        });
      }],
    },
    returnResult({reject, resolve, of: 'getSweeps'}, cbk));
  });
};
