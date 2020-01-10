const {emitGrpcEvents} = require('./../lnd_gateway');

interface GrpcConnection {
  cert?: string;
  socket?: string;
  ws: Function;
}

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
export default function(connection: GrpcConnection): void {
  return emitGrpcEvents({
    cert: connection.cert,
    socket: connection.socket,
    ws: connection.ws,
  });
}
