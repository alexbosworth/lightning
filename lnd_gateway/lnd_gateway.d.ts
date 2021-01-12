import * as request from 'request';
import WebSocket = require('ws');
import {AuthenticatedLnd} from '../lnd_grpc/authenticated_lnd_grpc';
import {UnauthenticatedLnd} from '../lnd_grpc/unauthenticated_lnd_grpc';

export type UnauthenticatedLndGatewayServer = {
  /** Base64 or Hex Serialized Gateway TLS Cert String */
  cert?: string;
  /** Request Function */
  request: (
    options: request.Options,
    callback: request.RequestCallback
  ) => request.Request;
  /** LND Gateway URL String */
  url: string;
  /** Websocket Constructor Function */
  websocket: typeof WebSocket;
};

export type AuthenticatedLndGatewayServer = UnauthenticatedLndGatewayServer & {
  /** Use Base 64 Encoded Macaroon String */
  macaroon: string;
};

/**
 * Interface to an LND gateway server.
 */
export function lndGateway(
  server: AuthenticatedLndGatewayServer
): {lnd: AuthenticatedLnd};

/**
 * Interface to an LND gateway server.
 */
export function lndGateway(
  server: UnauthenticatedLndGatewayServer
): {lnd: UnauthenticatedLnd};
