# Versions

## 3.2.20

- `authenticatedLndGrpc`: Allow not specifying a macaroon

## 3.2.2

- `getAccessIds`: Add method to list access ids
- `grantAccess`: Add method to generate a macaroon
- `revokeAccess`: Add method to revoke a macaroon
- `signMessage`: Add method to sign a message
- `verifyMessage`: Add method to verify a message signature

## 3.1.0

- `addPeer`: Add method to add a peer
- `cancelHodlInvoice`: Add method to cancel an invoice
- `createHodlInvoice`: Add method to create a HODL invoice
- `createInvoice`: Add method to create an invoice
- `diffieHellmanComputeSecret`: Add method to derive a shared secret
- `getInvoice`: Add method to lookup an invoice
- `getInvoices`: Add method to fetch past invoicies
- `getPeers`: Add method to list connected peers
- `removePeer`: Add method to disconnect a connected peer
- `settleHodlInvoice`: Add method to settle an accepted HODL invoice
- `signBytes`: Add method to sign arbitrary bytes
- `signTransaction`: Add method to create a transaction signature
- `subscribeToInvoice`: Add method to subscribe to updates to an invoice
- `subscribeToInvoices`: Add method to subscribe to invoice updates
- `verifyBytesSignature`: Add method to validate a signature over arbitrary bytes

## 3.0.22

- `emitGrpcEvents`: Cancel subscriptions when websocket connection is lost

## 3.0.19

Support for versions of LND lower than v0.11.0 is ended due to security issues with those
releases.

### Breaking Changes

- `authenticatedLndGrpc`: Eliminate `router_legacy`

## 2.0.55

- `authenticatedLndGrpc`: Adjust for changes to LND proto files
- `unauthenticatedLndGrpc`: Adjust for changes to LND proto files

## 2.0.3

- `authenticatedLndGrpc`: Fix support for hex encoded macaroons

## 2.0.0

- `authenticatedLndGrpc`: Add support for version RPC server

### Breaking Changes

- `authenticatedLndGrpc`: LND 0.9.2 and below: `router` is now `router_legacy`
- `emitGrpcEvents`: `arguments` renamed to `params`
- `grpcRouter`: `arguments` renamed to `params`
- `lndGateway`: `arguments` renamed to `params`

## 1.2.10

- `emitGrpcEvents`: Support large responses

## 1.2.2

- `emitGrpcEvents`: Add method to create a gateway websocket emitter

## 1.1.0

- `grpcRouter`: Add method to create a gateway proxy for Express servers
- `lndGateway`: Add method to create object that can use a gateway proxy

## 1.0.2

- `authenticatedLndGrpc`: Fix macaroon attachment

## 1.0.1

- Add typescript support

## 1.0.0

- Add `authenticatedLndGrpc` to access authentication required gRPC LND methods
- Add `unauthenticatedLndGrpc` to access no-auth gRPC methods
