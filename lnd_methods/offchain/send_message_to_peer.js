const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const bufferFromHex = hex => Buffer.from(hex, 'hex');
const defaultMessageType = 32768;
const isHex = n => !!n && !(n.length % 2) && /^[0-9A-F]*$/i.test(n);
const isPublicKey = n => !!n && /^[0-9A-F]{66}$/i.test(n);
const method = 'sendCustomMessage';
const notSupported = /unknown/;
const type = 'default';

/** Send a custom message to a connected peer

  If specified, message type is expected to be between 32768 and 65535

  Message data should not be larger than 65533 bytes

  Note: this method is not supported in LND versions 0.13.4 and below

  Requires `offchain:write` permission

  {
    lnd: <Authenticated LND API Object>
    message: <Message Hex String>
    public_key: <To Peer Public Key Hex String>
    [type]: <Message Type Number>
  }

  @returns via cbk or Promise
*/
module.exports = (args, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({method, type, lnd: args.lnd})) {
          return cbk([400, 'ExpectedAuthenticatedLndToSendMessageToPeer']);
        }

        if (!isHex(args.message)) {
          return cbk([400, 'ExpectedCustomMessageDataToSendToPeer']);
        }

        if (!isPublicKey(args.public_key)) {
          return cbk([400, 'ExpectedPeerPublicKeyToSendMessageTo']);
        }

        return cbk();
      },

      // Send the message to the peer
      send: ['validate', ({}, cbk) => {
        return args.lnd[type][method]({
          data: bufferFromHex(args.message),
          peer: bufferFromHex(args.public_key),
          type: args.type || defaultMessageType,
        },
        err => {
          if (!!err && notSupported.test(err.details)) {
            return cbk([501, 'SendMessageToPeerMethodNotSupported']);
          }

          if (!!err) {
            return cbk([503, 'UnexpectedErrorSendingMessageToPeer', {err}]);
          }

          return cbk();
        });
      }],
    },
    returnResult({reject, resolve}, cbk));
  });
};
