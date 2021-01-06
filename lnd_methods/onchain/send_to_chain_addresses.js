const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const initialConfirmationCount = 0;
const {isArray} = Array;
const method = 'sendMany';
const OPEN = 1;
const unconfirmedConfCount = 0;
const {stringify} = JSON;
const type = 'default';

/** Send tokens to multiple destinations in a blockchain transaction.

  Requires `onchain:write` permission

  `utxo_confirmations` is not supported on LND 0.11.1 or below

  {
    [description]: <Transaction Label String>
    [fee_tokens_per_vbyte]: <Chain Fee Tokens Per Virtual Byte Number>
    lnd: <Authenticated LND API Object>
    [log]: <Log Function>
    send_to: [{
      address: <Address String>
      tokens: <Tokens Number>
    }]
    [target_confirmations]: <Confirmations To Wait Number>
    [utxo_confirmations]: <Minimum Confirmations for UTXO Selection Number>
    [wss]: [<Web Socket Server Object>]
  }

  @returns via cbk or Promise
  {
    confirmation_count: <Total Confirmations Number>
    id: <Transaction Id Hex String>
    is_confirmed: <Transaction Is Confirmed Bool>
    is_outgoing: <Transaction Is Outgoing Bool>
    tokens: <Transaction Tokens Number>
  }
*/
module.exports = (args, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({method, type, lnd: args.lnd})) {
          return cbk([400, 'ExpectedLndToSendToChainAddresses']);
        }

        if (!isArray(args.send_to) || !args.send_to.length) {
          return cbk([400, 'ExpectedSendToAddressesAndTokens']);
        }

        if (args.send_to.find(({address, tokens}) => !address || !tokens)) {
          return cbk([400, 'ExpectedAddrsAndTokensWhenSendingToAddresses']);
        }

        if (!!args.wss && !isArray(args.wss)) {
          return cbk([400, 'ExpectedWssArrayForSendToChainAddresses']);
        }

        if (!!args.wss && !args.log) {
          return cbk([400, 'ExpectedLogForChainSendWebSocketAnnouncement']);
        }

        return cbk();
      },

      send: ['validate', ({}, cbk) => {
        const AddrToAmount = {};

        args.send_to
          .forEach(({address, tokens}) => AddrToAmount[address] = tokens);

        const send = {
          AddrToAmount,
          label: args.description || undefined,
          min_confs: args.utxo_confirmations || undefined,
          sat_per_byte: args.fee_tokens_per_vbyte || undefined,
          spend_unconfirmed: args.utxo_confirmations === unconfirmedConfCount,
          target_conf: args.target_confirmations || undefined,
        };

        return args.lnd.default.sendMany(send, (err, res) => {
          if (!!err) {
            return cbk([500, 'UnexpectedSendManyError', {err}]);
          }

          if (!res) {
            return cbk([500, 'ExpectedResponseFromSendManyRequest']);
          }

          if (!res.txid) {
            return cbk([500, 'ExpectedTxIdForSendManyTransaction', res]);
          }

          const row = {
            confirmation_count: initialConfirmationCount,
            id: res.txid,
            is_confirmed: false,
            is_outgoing: true,
            tokens: args.send_to.reduce((sum, n) => sum + n.tokens, Number()),
          };

          if (!!args.wss) {
            args.wss.forEach(({clients}) => {
              // Client is a Set not an array so .filter cannot be used
              return clients.forEach(client => {
                if (!client || client.readyState !== OPEN) {
                  return;
                }

                try {
                  return client.send(stringify(row));
                } catch (err) {
                  return args.log([500, 'BroadcastFailure', {err}]);
                }
              });
            });
          }

          return cbk(null, row);
        });
      }],
    },
    returnResult({reject, resolve, of: 'send'}, cbk));
  });
};
