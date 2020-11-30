"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitGrpcEvents = void 0;
const lnd_gateway_1 = require("./../lnd_gateway");
/**
 * Emit events from a gRPC call
 */
function emitGrpcEvents(connection) {
    return lnd_gateway_1.emitGrpcEvents({
        cert: connection.cert,
        socket: connection.socket,
        ws: connection.ws,
    });
}
exports.emitGrpcEvents = emitGrpcEvents;
//# sourceMappingURL=emit_grpc_events.js.map