"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.grpcRouter = void 0;
/**
 * Get a gRPC gateway router
 */
function grpcRouter(credentials) {
    return grpcRouter({ cert: credentials.cert, socket: credentials.socket });
}
exports.grpcRouter = grpcRouter;
//# sourceMappingURL=grpc_router.js.map