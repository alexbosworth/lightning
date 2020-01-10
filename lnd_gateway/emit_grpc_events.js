const {decodeFirst} = require('cbor');
const {encode} = require('cbor');

const {authenticatedLndGrpc} = require('./../lnd_grpc');
const subscribeToResponse = require('./subscribe_to_response');

const encodeResponse = (event, data) => encode({data, event});
const encodeType = 'blob';
const invalidMessageErr = 'ExpectedValidCborWsMessage';

/** Emit events from a gRPC call

  {
    [cert]: <Base64 or Hex Serialized LND TLS Cert String>
    [socket]: <Host:Port Network Address String>
    ws: {
      on: <Add Event Listener Function>
      send: <Send Data Function>
    }
  }
*/
module.exports = ({cert, socket, ws}) => {
  let cancel = () => {};

  ws.binaryType = encodeType;

  ws.on('close', () => cancel());

  ws.on('message', message => {
    return decodeFirst(message, (err, decoded) => {
      if (!!err) {
        return ws.send(encodeResponse('error', {details: invalidMessageErr}));
      }

      const {arguments, macaroon, method, server} = decoded;

      const {lnd} = authenticatedLndGrpc({cert, macaroon, socket});

      const sub = subscribeToResponse({arguments, lnd, method, server, ws});

      cancel = sub.cancel;

      return;
    });
  });
};
