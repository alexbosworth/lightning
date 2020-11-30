"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unauthenticatedLndGateway = void 0;
const lnd_gateway_1 = require("../lnd_gateway");
/**
 * Interface to an unauthenticated LND gateway server.
 */
function unauthenticatedLndGateway(server) {
    return lnd_gateway_1.lndGateway({
        cert: server.cert,
        request: server.request,
        url: server.url,
        websocket: server.websocket,
    });
}
exports.unauthenticatedLndGateway = unauthenticatedLndGateway;
//# sourceMappingURL=unauthenticated_lnd_gateway.js.map