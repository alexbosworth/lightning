"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { lndGateway } = require('./../lnd_gateway');
/** Interface to an LND gateway server.

  {
    [cert]: <Base64 or Hex Serialized Gateway TLS Cert String>
    [macaroon]: <Use Base 64 Encoded Macaroon String>
    request: <Request Function>
    url: <LND Gateway URL String>
    websocket: <Websocket Constructor Function>
  }

  @throws
  <Error>

  @returns
  {
    lnd: <LND gRPC Gateway Object>
  }
*/
function default_1(server) {
    return lndGateway({
        cert: server.cert,
        macaroon: server.macaroon,
        request: server.request,
        url: server.url,
        websocket: server.websocket,
    });
}
exports.default = default_1;
//# sourceMappingURL=lnd_gateway.js.map