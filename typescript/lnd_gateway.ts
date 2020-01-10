const {lndGateway} = require('./../lnd_gateway');

interface Server {
  cert?: string;
  macaroon?: string;
  request: Function;
  url: string;
  websocket: Function;
}

/** Interface to an LND gateway server.

  {
    [cert]: <Base64 or Hex Serialized Gateway TLS Cert String>
    [macaroon]: <Use Base 64 Encoded Macaroon String>
    request: <Request Function>
    url: <LND Gateway URL String>
    websocket: <Websocket Constructor Function>
  }

  @throws
  <Error>

  @returns
  {
    lnd: <LND gRPC Gateway Object>
  }
*/
export default function(server: Server): any {
  return lndGateway({
    cert: server.cert,
    macaroon: server.macaroon,
    request: server.request,
    url: server.url,
    websocket: server.websocket,
  });
}
