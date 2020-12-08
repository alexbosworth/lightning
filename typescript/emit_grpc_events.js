"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { emitGrpcEvents } = require('./../lnd_gateway');
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
function default_1(connection) {
    return emitGrpcEvents({
        cert: connection.cert,
        socket: connection.socket,
        ws: connection.ws,
    });
}
exports.default = default_1;
//# sourceMappingURL=emit_grpc_events.js.map