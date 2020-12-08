interface Credentials {
    cert?: string;
    socket?: string;
}
/** Get a gRPC gateway router

  {
    [cert]: <Base64 or Hex Serialized LND TLS Cert String>
    [socket]: <Host:Port Network Address String>
  }

  @returns
  <Router Object>
*/
export default function (credentials: Credentials): any;
export {};
