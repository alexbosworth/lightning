import {authenticatedLndGrpc} from './../lnd_grpc';

interface LndAuthentication {
  cert?: string;
  macaroon: string;
  socket?: string;
}

/** Initiate an gRPC API Methods Object for authenticated methods

  Both the cert and macaroon expect the entire serialized lnd generated file

  {
    [cert]: <Base64 or Hex Serialized LND TLS Cert>
    macaroon: <Base64 or Hex Serialized Macaroon String>
    [socket]: <Host:Port Network Address String>
  }

  @throws
  <Error>

  @returns
  {
    lnd: {
      autopilot: <Autopilot gRPC Methods Object>
      chain: <ChainNotifier gRPC Methods Object>
      default: <Default gRPC Methods Object>
      invoices: <Invoices gRPC Methods Object>
      router: <Router gRPC Methods Object>
      signer: <Signer gRPC Methods Object>
      wallet: <WalletKit gRPC Methods Object>
    }
  }
*/
export default function(auth: LndAuthentication): {lnd: any} {
  return authenticatedLndGrpc({
    cert: auth.cert,
    macaroon: auth.macaroon,
    socket: auth.socket,
  });
}
