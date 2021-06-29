const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const method = 'verifyMessage';
const type = 'default';
const utf8StringAsBuffer = str => Buffer.from(str, 'utf8');

/** Verify a message was signed by a known pubkey

  Requires `message:read` permission

  {
    lnd: <Authenticated LND API Object>
    message: <Message String>
    signature: <Signature String>
  }

  @returns via cbk or Promise
  {
    signed_by: <Public Key Hex String>
  }
*/
module.exports = ({lnd, message, signature}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedLndForVerifyMessage']);
        }

        if (!message) {
          return cbk([400, 'ExpectedMessageToVerify']);
        }

        if (!signature) {
          return cbk([400, 'ExpectedSignatureToVerifyAgainst']);
        }

        return cbk();
      },

      // Check message
      verify: ['validate', ({}, cbk) => {
        const msg = utf8StringAsBuffer(message);

        return lnd[type][method]({msg, signature}, (err, res) => {
          if (!!err) {
            return cbk([503, 'UnexpectedVerifyMessageError', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedResultForVerifyMessageRequest']);
          }

          if (!res.pubkey) {
            return cbk([503, 'ExpectedPublicKeyInVerifyMessageResponse']);
          }

          return cbk(null, {signed_by: res.pubkey});
        });
      }],
    },
    returnResult({reject, resolve, of: 'verify'}, cbk));
  });
};
