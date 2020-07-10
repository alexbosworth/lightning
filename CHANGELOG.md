# Versions

## 2.0.23

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
