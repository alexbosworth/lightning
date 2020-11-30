"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticatedLndGrpc = void 0;
const lnd_grpc_1 = require("./../lnd_grpc");
/**
 * Initiate a gRPC API Methods Object for authenticated methods
 *
 * Both the `cert` and `macaroon` expect the entire serialized LND generated file
 */
function authenticatedLndGrpc(auth) {
    return lnd_grpc_1.authenticatedLndGrpc(auth);
}
exports.authenticatedLndGrpc = authenticatedLndGrpc;
//# sourceMappingURL=authenticated_lnd_grpc.js.map