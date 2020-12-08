import {emitGrpcEvents as _emitGrpcEvents} from "./../lnd_gateway";

export type GrpcConnection = {
  /** Base64 or Hex Serialized LND TLS Cert String */
  cert?: string;
  /** Host:Port Network Address String */
  socket?: string;
  ws: {
    /** Add Event Listener Function */
    on: (event: string, listener: (...args: any[]) => void) => void;
    /** Send Data Function */
    send: (message: any) => void;
  };
};

/**
 * Emit events from a gRPC call
 */
export function emitGrpcEvents(connection: GrpcConnection): void {
  return _emitGrpcEvents({
    cert: connection.cert,
    socket: connection.socket,
    ws: connection.ws,
  });
}
