const {encodeAsync} = require('cbor');

/** Make a request to LND that returns subscription events

  {
    lnd: <LND API Object>
    method: <LND Method Name String>
    params: <Method Arguments Object>
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
module.exports = ({lnd, method, params, server, ws}) => {
  const sub = lnd[server][method](params);

  const sendResponse = async (ws, event, data) => {
    return ws.send(await encodeAsync({data, event}));
  };

  sub.on('data', data => sendResponse(ws, 'data', data));
  sub.on('end', () => sendResponse(ws, 'end'));
  sub.on('status', s => sendResponse(ws, 'status', s));

  sub.on('error', err => sendResponse(ws, 'error', {
    details: err.details,
    message: err.message,
  }));

  ws.on('close', () => sub.cancel());

  return {cancel: () => sub.cancel()};
};
