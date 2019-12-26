interface LndAuthentication {
    cert?: string;
    socket?: string;
}
/** Unauthenticated gRPC interface to the Lightning Network Daemon (lnd).

  Make sure to provide a cert when using LND with its default self-signed cert

  {
    [cert]: <Base64 or Hex Serialized LND TLS Cert String>
    [socket]: <Host:Port String>
  }

  @throws
  <Error>

  @returns
  {
    lnd: {
      unlocker: <Unlocker LND GRPC Api Object>
    }
  }
*/
export default function (auth: LndAuthentication): {
    lnd: any;
};
export {};
