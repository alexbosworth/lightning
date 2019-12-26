"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lnd_grpc_1 = require("./../lnd_grpc");
/** Unauthenticated gRPC interface to the Lightning Network Daemon (lnd).

  Make sure to provide a cert when using LND with its default self-signed cert

  {
    [cert]: <Base64 or Hex Serialized LND TLS Cert String>
    [socket]: <Host:Port String>
  }

  @throws
  <Error>

  @returns
  {
    lnd: {
      unlocker: <Unlocker LND GRPC Api Object>
    }
  }
*/
function default_1(auth) {
    return lnd_grpc_1.unauthenticatedLndGrpc({ cert: auth.cert, socket: auth.socket });
}
exports.default = default_1;
//# sourceMappingURL=unauthenticated_lnd_grpc.js.map