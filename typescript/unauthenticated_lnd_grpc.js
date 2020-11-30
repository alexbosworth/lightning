"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unauthenticatedLndGrpc = void 0;
const lnd_grpc_1 = require("./../lnd_grpc");
/**
 * Unauthenticated gRPC interface to the Lightning Network Daemon (lnd).
 */
function unauthenticatedLndGrpc(auth) {
    return lnd_grpc_1.unauthenticatedLndGrpc({ cert: auth.cert, socket: auth.socket });
}
exports.unauthenticatedLndGrpc = unauthenticatedLndGrpc;
//# sourceMappingURL=unauthenticated_lnd_grpc.js.map