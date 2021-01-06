const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const method = 'signMessage';
const utf8AsBuffer = utf8 => Buffer.from(utf8, 'utf8');
const type = 'default';

/** Sign a message

  Requires `message:write` permission

  {
    lnd: <Authenticated LND API Object>
    message: <Message String>
  }

  @returns via cbk or Promise
  {
    signature: <Signature String>
  }
*/
module.exports = ({lnd, message}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedLndToSignMessage']);
        }

        if (!message) {
          return cbk([400, 'ExpectedMessageToSign']);
        }

        return cbk();
      },

      // Sign message
      sign: ['validate', ({}, cbk) => {
        return lnd[type][method]({msg: utf8AsBuffer(message)}, (err, res) => {
          if (!!err) {
            return cbk([503, 'UnexpectedSignMessageError', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedResponseToSignMessageRequest']);
          }

          if (!res.signature) {
            return cbk([503, 'ExpectedSignatureForMessageSignRequest']);
          }

          return cbk(null, {signature: res.signature});
        });
      }],
    },
    returnResult({reject, resolve, of: 'sign'}, cbk));
  });
};
