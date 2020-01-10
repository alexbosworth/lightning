const {encode} = require('cbor');

const sendResponse = (ws, event, data) => ws.send(encode({data, event}));

/** Make a request to LND that returns subscription events

  {
    arguments: <Method Arguments Object>
    lnd: <LND gRPC API Object>
    method: <LND Method Name String>
    server: <LND RPC Server Name String>
    ws: {
      on: <Websocket Attach Listener Function>
      send: <Send Response Function>
    }
  }

  @returns
  {
    cancel: <Cancel Request Function>
  }
*/
module.exports = ({arguments, lnd, method, server, ws}) => {
  const sub = lnd[server][method](arguments);

  sub.on('data', data => sendResponse(ws, 'data', data));
  sub.on('end', () => sendResponse(ws, 'end'));
  sub.on('status', s => sendResponse(ws, 'status', s));

  sub.on('error', err => sendResponse(ws, 'error', {
    details: err.details,
    message: err.message,
  }));

  return {cancel: () => sub.cancel()};
};
