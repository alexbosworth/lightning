# Lightning

[![npm version](https://badge.fury.io/js/lightning.svg)](https://badge.fury.io/js/lightning)
[![Coverage Status](https://coveralls.io/repos/github/alexbosworth/lightning/badge.svg?branch=master)](https://coveralls.io/github/alexbosworth/lightning?branch=master)
[![Build Status](https://travis-ci.org/alexbosworth/lightning.svg?branch=master)](https://travis-ci.org/alexbosworth/lightning)

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

### addPeer

Add a peer if possible (not self, or already connected)

Requires `peers:write` permission

`timeout` is not supported in LND 0.11.1 and below

    {
      [is_temporary]: <Add Peer as Temporary Peer Bool> // Default: false
      lnd: <Authenticated LND API Object>
      public_key: <Public Key Hex String>
      [retry_count]: <Retry Count Number>
      [retry_delay]: <Delay Retry By Milliseconds Number>
      socket: <Host Network Address And Optional Port String> // ip:port
      [timeout]: <Connection Attempt Timeout Milliseconds Number>
    }

    @returns via cbk or Promise

Example:

```node
const {addPeer} = require('lightning');
const socket = hostIp + ':' + portNumber;
await addPeer({lnd, socket, public_key: publicKeyHexString});
```

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
        autopilot: <Autopilot API Methods Object>
        chain: <ChainNotifier API Methods Object>
        default: <Default API Methods Object>
        invoices: <Invoices API Methods Object>
        router: <Router API Methods Object>
        signer: <Signer Methods API Object>
        tower_client: <Watchtower Client Methods Object>
        tower_server: <Watchtower Server Methods API Object>
        wallet: <WalletKit gRPC Methods API Object>
        version: <Version Methods API Object>
      }
    }

Example:

```node
const {authenticatedLndGrpc} = require('lightning');

const {lnd} = authenticatedLndGrpc({
  cert: 'base64 encoded tls.cert',
  macaroon: 'base64 encoded admin.macaroon',
  socket: '127.0.0.1:10009',
});
```

### cancelHodlInvoice

Cancel an invoice

This call can cancel both HODL invoices and also void regular invoices

Requires LND built with `invoicesrpc`

Requires `invoices:write` permission

    {
      id: <Payment Preimage Hash Hex String>
      lnd: <Authenticated RPC LND API Object>
    }

Example:

```node
const {cancelHodlInvoice} = require('lightning');
const id = paymentRequestPreimageHashHexString;
await cancelHodlInvoice({id, lnd});
```

### createChainAddress

Create a new receive address.

Requires `address:write` permission

    {
      format: <Receive Address Type String> // "np2wpkh" || "p2wpkh"
      [is_unused]: <Get As-Yet Unused Address Bool>
      lnd: <Authenticated LND API Object>
    }

Example:

```node
const {createChainAddress} = require('lightning');
const format = 'p2wpkh';
const {address} = await createChainAddress({format, lnd});
```

### createHodlInvoice

Create HODL invoice. This invoice will not settle automatically when an
HTLC arrives. It must be settled separately with the secret preimage.

Warning: make sure to cancel the created invoice before its CLTV timeout.

Requires LND built with `invoicesrpc` tag

Requires `address:write`, `invoices:write` permission

    {
      [cltv_delta]: <Final CLTV Delta Number>
      [description]: <Invoice Description String>
      [description_hash]: <Hashed Description of Payment Hex String>
      [expires_at]: <Expires At ISO 8601 Date String>
      [id]: <Payment Hash Hex String>
      [is_fallback_included]: <Is Fallback Address Included Bool>
      [is_fallback_nested]: <Is Fallback Address Nested Bool>
      [is_including_private_channels]: <Invoice Includes Private Channels Bool>
      lnd: <Authenticated LND API Object>
      [mtokens]: <Millitokens String>
      [tokens]: <Tokens Number>
    }

    @returns via cbk or Promise
    {
      [chain_address]: <Backup Address String>
      created_at: <ISO 8601 Date String>
      description: <Description String>
      id: <Payment Hash Hex String>
      mtokens: <Millitokens Number>
      request: <BOLT 11 Encoded Payment Request String>
      [secret]: <Hex Encoded Payment Secret String>
      tokens: <Tokens Number>
    }

Example:

```node
const {createHash, randomBytes} = require('crypto');
const {createHodlInvoice, settleHodlInvoice} = require('lightning');
const {subscribeToInvoice} = require('lightning');

const randomSecret = () => randomBytes(32);
const sha256 = buffer => createHash('sha256').update(buffer).digest('hex');

// Choose an r_hash for this invoice, a single sha256, on say randomBytes(32)
const secret = randomSecret();

const id = sha256(secret);

// Supply an authenticatedLndGrpc object for an lnd built with invoicesrpc tag
const {request} = await createHodlInvoice({id, lnd});

// Share the request with the payer and wait for a payment
const sub = subscribeToInvoice({id, lnd});

sub.on('invoice_updated', async invoice => {
  // Only actively held invoices can be settled
  if (!invoice.is_held) {
    return;
  }

  // Use the secret to claim the funds
  await settleHodlInvoice({lnd, secret: secret.toString('hex')});
});
```

### emitGrpcEvents

Emit events from a gRPC call

    {
      [cert]: <Base64 or Hex Serialized LND TLS Cert String>
      [socket]: <Host:Port Network Address String>
      ws: {
        on: <Add Event Listener Function>
        send: <Send Data Function>
      }
    }

Example:

```node
const {emitGrpcEvents} = require('lightning');
const {Server} = require('ws');

const app = express();

const server = app.listen(port);

const wss = new Server({server});

wss.on('listening', () => {});
wss.on('connection', ws => emitGrpcEvents({cert, socket, ws}));
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
