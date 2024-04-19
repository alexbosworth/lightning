const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');
const {rpcTxAsTransaction} = require('./../../lnd_responses');

const isHash = n => !!n && /^[0-9A-F]{64}$/i.test(n);
const method = 'getTransaction';
const notSupported = /unknown.*walletrpc.WalletKit/;
const type = 'wallet';

/** Get a chain transaction.

  Requires `onchain:read` permission

  This method is not supported on LND 0.17.5 and below

  {
    id: <Transaction Id Hex String>
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk or Promise
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
module.exports = ({id, lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isHash(id)) {
          return cbk([400, 'ExpectedIdentifyingTxHashOfChainTxToRetrieve']);
        }

        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedLndToGetChainTransaction']);
        }

        return cbk();
      },

      // Get transaction
      getTransaction: ['validate', ({}, cbk) => {
        return lnd[type][method]({txid: id}, (err, res) => {
          if (!!err && notSupported.test(err.details)) {
            return cbk([501, 'GetChainTransactionMethodNotSupported']);
          }

          if (!!err) {
            return cbk([503, 'UnexpectedGetChainTransactionError', {err}]);
          }

          try {
            return cbk(null, rpcTxAsTransaction(res));
          } catch (err) {
            return cbk([503, err.message]);
          }
        });
      }],
    },
    returnResult({reject, resolve, of: 'getTransaction'}, cbk));
  });
};
