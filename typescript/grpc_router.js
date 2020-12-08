"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { grpcRouter } = require('./../lnd_gateway');
/** Get a gRPC gateway router

  {
    [cert]: <Base64 or Hex Serialized LND TLS Cert String>
    [socket]: <Host:Port Network Address String>
  }

  @returns
  <Router Object>
*/
function default_1(credentials) {
    return grpcRouter({ cert: credentials.cert, socket: credentials.socket });
}
exports.default = default_1;
//# sourceMappingURL=grpc_router.js.map