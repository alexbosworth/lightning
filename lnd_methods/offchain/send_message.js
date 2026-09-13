const asyncAuto = require('async/auto');
const {onionForPath} = require('bolt04');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const errorPeerDisconnected = /^peer [0-9a-f]{66} disconnected$/;
const errorUnknownMethod = /unknown method SendOnionMessage/;
const errorsDisconnected = ['peer exiting', 'peer is not connected'];
const hexAsBuffer = hex => Buffer.from(hex, 'hex');
const {isArray} = Array;
const isHex = n => !(n.length % 2) && /^[0-9A-F]*$/i.test(n);
const isHexString = n => typeof n === 'string' && isHex(n);
const isTypeNumber = n => typeof n === 'string' && /^\d+$/.test(n);
const method = 'sendOnionMessage';
const type = 'default';

/** Send a generic message over the network

  The receiver of the message needs to first publish an inbound path to them,
  this is supplied via `inbound`. To send, add a series of relaying node ids
  that support message passing, to a landmark node provided by the receiver.

  This method is not supported in LND 0.20.4 and below

  {
    inbound: [{
      encrypted_data: <Encrypted Data Hex String>
      relay_key: <Blinded Relaying Public Key Into Destination Hex String>
    }]
    key: <Message Path Key Hex String>
    lnd: <Authenticated LND API Object>
    [message]: {
      type: <Message Payload Record Type Number String>
      value: <Message Payload Hex String>
    }
    outbound: [<Relaying Node Public Key Out of Source Hex String>]
    [reply]: [<Reply Path Relaying Node Public Key Back To Sender Hex String>]
  }

  @returns via cbk or Promise
  {
    [reply]: <Reply Identifier Hex String>
  }
*/
module.exports = ({inbound, key, lnd, message, outbound, reply}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isArray(inbound)) {
          return cbk([400, 'ExpectedArrayOfInboundRelayKeysToSendMessage']);
        }

        if (!key) {
          return cbk([400, 'ExpectedMessagePathKeyToSendMessage']);
        }

        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedAuthenticatedLndToSendMessageToNode']);
        }

        if (!!message && !isTypeNumber(message.type)) {
          return cbk([400, 'ExpectedMessageTypeNumberStringToSendMessage']);
        }

        if (!!message && !isHexString(message.value)) {
          return cbk([400, 'ExpectedHexEncodedMessageValueToSendMessage']);
        }

        if (!isArray(outbound)) {
          return cbk([400, 'ExpectedArrayOfOutboundRelaysToSendMessage']);
        }

        if (!outbound.length) {
          return cbk([400, 'ExpectedOutboundPeerToSendMessage']);
        }

        if (!!reply && !isArray(reply)) {
          return cbk([400, 'ExpectedArrayOfReplyRelaysToSendMessage']);
        }

        return cbk();
      },

      // Encode the onion packet to transmit to the peer
      encodeOnion: ['validate', ({}, cbk) => {
        // The message is the single payload record of the final hop
        const records = [message].filter(n => !!n);

        try {
          const path = onionForPath({inbound, key, outbound, records, reply});

          return cbk(null, {key: path.key, onion: path.onion, reply: path.id});
        } catch (err) {
          return cbk([400, 'ExpectedValidHopsAndMessageToSendMessage', {err}]);
        }
      }],

      // Send the message
      send: ['encodeOnion', ({encodeOnion}, cbk) => {
        const [peer] = outbound;

        return lnd[type][method]({
          onion: hexAsBuffer(encodeOnion.onion),
          path_key: hexAsBuffer(encodeOnion.key),
          peer: hexAsBuffer(peer),
        },
        err => {
          if (!!err && errorUnknownMethod.test(err.details)) {
            return cbk([501, 'SendOnionMessageMethodUnsupported']);
          }

          if (!!err && errorsDisconnected.includes(err.details)) {
            return cbk([503, 'ExpectedConnectedOutboundPeerToSendMessage']);
          }

          if (!!err && errorPeerDisconnected.test(err.details)) {
            return cbk([503, 'ExpectedConnectedOutboundPeerToSendMessage']);
          }

          if (!!err) {
            return cbk([503, 'UnexpectedErrorSendingMessage', {err}]);
          }

          return cbk(null, {reply: encodeOnion.reply});
        });
      }],
    },
    returnResult({reject, resolve, of: 'send'}, cbk));
  });
};
