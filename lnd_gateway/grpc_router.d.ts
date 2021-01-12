import {Router} from 'express';

export type Credentials = {
  /** Base64 or Hex Serialized LND TLS Cert String */
  cert?: string;
  /** Host:Port Network Address String */
  socket?: string;
};

/**
 * Get a gRPC gateway router
 */
export function grpcRouter(credentials: Credentials): Router;
