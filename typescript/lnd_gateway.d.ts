interface Server {
    cert?: string;
    macaroon?: string;
    request: Function;
    url: string;
}
/** Interface to an LND gateway server.

  {
    [cert]: <Base64 or Hex Serialized Gateway TLS Cert String>
    [macaroon]: <Use Base 64 Encoded Macaroon String>
    request: <Request Function>
    url: <LND Gateway URL String>
  }

  @throws
  <Error>

  @returns
  {
    lnd: <LND gRPC Gateway Object>
  }
*/
export default function (server: Server): any;
export {};
