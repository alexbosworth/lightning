const {decodeFirst} = require('cbor');

const {authenticatedLndGrpc} = require('./../lnd_grpc');
const encodeResponse = require('./encode_response');
const subscribeToResponse = require('./subscribe_to_response');

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
    return decodeFirst(message, async (err, decoded) => {
      if (!!err) {
        const {response} = await encodeResponse({
          data: {details: invalidMessageErr},
          event: 'error',
        });

        return ws.send(response);
      }

      const {macaroon, method, params, server} = decoded;

      const {lnd} = authenticatedLndGrpc({cert, macaroon, socket});

      const sub = subscribeToResponse({lnd, method, params, server, ws});

      cancel = sub.cancel;

      return;
    });
  });
};
