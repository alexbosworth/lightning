"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticatedLndGateway = void 0;
const lnd_gateway_1 = require("./../lnd_gateway");
/**
 * Interface to an authenticated LND gateway server.
 */
function authenticatedLndGateway(server) {
    return lnd_gateway_1.lndGateway({
        cert: server.cert,
        macaroon: server.macaroon,
        request: server.request,
        url: server.url,
        websocket: server.websocket,
    });
}
exports.authenticatedLndGateway = authenticatedLndGateway;
//# sourceMappingURL=authenticated_lnd_gateway.js.map