import type {Router} from 'express';
import {grpcRouter as _grpcRouter} from '../lnd_gateway';

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
