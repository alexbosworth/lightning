# Lightning

Methods for working with the Lightning Network

## LND Authentication

To connect to an LND node, authentication details are required.

Export credentials via CLI:
[balanceofsatoshis](https://github.com/alexbosworth/balanceofsatoshis):
`npm install -g balanceofsatoshis` and export via `bos credentials --cleartext`

Or export them manually:

Run `base64` on the tls.cert and admin.macaroon files to get the encoded
authentication data to create the LND connection. You can find these files in
the LND directory. (~/.lnd or ~/Library/Application Support/Lnd)

    base64 ~/.lnd/tls.cert | tr -d '\n'
    base64 ~/.lnd/data/chain/bitcoin/mainnet/admin.macaroon | tr -d '\n'

You can then use these to interact with your LND node directly:

```node
const {authenticatedLndGrpc} = require('lightning');

const {lnd} = authenticatedLndGrpc({
  cert: 'base64 encoded tls.cert file',
  macaroon: 'base64 encoded admin.macaroon file',
  socket: '127.0.0.1:10009',
});
```

To access unauthenticated methods like the wallet unlocker, use 
`unauthenticatedLndGrpc` instead.

## Methods

### authenticatedLndGrpc

Initiate an gRPC API Methods Object for LND authenticated methods.

    {
      [cert]: <Base64 or Hex Serialized LND TLS Cert>
      macaroon: <Base64 or Hex Serialized Macaroon String>
      [socket]: <Host:Port String>
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

Example:

```node
const authenticatedLndGrpc = require('lightning');

const {lnd} = authenticatedLndGrpc({
  cert: 'base64 encoded tls.cert',
  macaroon: 'base64 encoded admin.macaroon',
  socket: '127.0.0.1:10009',
});
```

### grpcRouter

Get a gRPC gateway router

    {
      [cert]: <Base64 or Hex Serialized LND TLS Cert String>
      [socket]: <Host:Port Network Address String>
    }

    @returns
    <Router Object>

Example:

```node
const {grpcRouter, lndGateway} = require('lightning');

const app = express();

// Start an Express server
app.listen(port);

// Attach grpc as a router
app.use('/grpc/', grpcRouter({}));
```

### lndGateway

Interface to an LND gateway server.

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

Example:

```node
const {lndGateway} = require('lightning');
const request = require('request');

// Set request to npm request package, macaroon to base64, url to Express server
const {lnd} = lndGateway({request, macaroon, url});

// Use lnd to make API calls proxied through the grpcRouter gateway server
```

### unauthenticatedLndGrpc

Unauthenticated gRPC interface to the Lightning Network Daemon (LND).

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

Example:

```node
const {unauthenticatedLndGrpc} = require('lightning');
const {lnd} = unauthenticatedLndGrpc({});
```
