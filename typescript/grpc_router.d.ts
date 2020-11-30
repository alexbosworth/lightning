import type { Router } from "express";
export declare type Credentials = {
    /** Base64 or Hex Serialized LND TLS Cert String */
    cert?: string;
    /** Host:Port Network Address String */
    socket?: string;
};
/**
 * Get a gRPC gateway router
 */
export declare function grpcRouter(credentials: Credentials): Router;
