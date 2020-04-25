const EventEmitter = require('events');

const {encodeAsync} = require('cbor');

const emitEvent = require('./emit_event');
const wsUrl = require('./ws_url');

/** Subscribe to a gateway stream response

  {
    bearer: <Bearer Authentication Token String>
    call: {
      method: <Call Method String>
      params: <Call Arguments Object>
      server: <Call Server String>
    }
    websocket: <WebSocket Constructor Function>
    url: <LND Gateway URL String>
  }

  @throws
  <Error>

  @returns
  {
    cancel: <Terminate Subscription Function>
    on: <Event Listener Function>
  }
*/
module.exports = ({bearer, call, websocket, url}) => {
  const emitter = new EventEmitter();

  const ws = new websocket(wsUrl({url}).url);

  ws.on('close', () => {});
  ws.on('error', err => emitter.emit('error', err));
  ws.on('message', message => emitEvent({emitter, message}))

  ws.on('open', async () => {
    const bytes = await encodeAsync({
      macaroon: bearer,
      method: call.method,
      params: call.params,
      server: call.server,
    });

    return ws.send(new Uint8Array(bytes));
  });

  emitter.cancel = () => ws.close();

  return emitter;
};
