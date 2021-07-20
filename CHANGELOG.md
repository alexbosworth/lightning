# Versions

## 3.4.0

- `getWalletVersion`: Add support for LND 0.13.1-beta
- `fundPsbt`: Add support for `min_confirmations`

## 3.3.16

- `subscribeToForwards`: Add `secret` attribute to settle forward events

## 3.3.15

- `getNode`: Return to fallback channels lookup when version commit hash is unavailable
- `getWalletVersion`: Add support for builds that do not report a commit hash

## 3.3.14

- `getNode`: Return to fallback channels lookup when version check is unavailable

## 3.3.13

- `getNode`: Optimize channel lookup speed on LND 0.13.0

## 3.3.12

- `getWalletVersion`: Add support for LND 0.13.0

## 3.3.10

- `pay`: Fix error when paying a zero amount invoice but specifying mtokens
- `subscribeToInvoices`: Fix restart timeout to add longer default timeout

## 3.3.9

- On payment requests, validate millitokens maximum fee is either a string or undefined

## 3.3.6

- `subscribeToForwards`: Correct output value documentation and type definitions

## 3.3.0

- `broadcastChainTransaction`: Add method to publish a raw transaction
- `cancelPendingChannel`: Add method to abort a channel open
- `closeChannel`: Add method to close a channel
- `fundPendingChannels`: Add method to add funding to opening channels
- `fundPsbt`: Add method to create a funded PSBT
- `getChainBalance`: Add method to retrieve the on-chain funds amount
- `getChainFeeEstimate`: Add method to estimate a chain-fee to send an on-chain tx
- `getChainFeeRate`: Add method to get a chain fee rate estimate
- `getChainTransactions`: Add method to list on-chain transactions
- `getPendingChainBalance`: Add method to retrieve the unconfirmed on-chain balance
- `getSweepTransactions`: Add method to list transactions related to sweeps
- `getUtxos`: Add method to list unspent coins
- `lockUtxo`: Add method to lease an unspent coin
- `openChannel`: Add method to create a new channel
- `openChannels`Add method to create multiple new channels
- `prepareForChannelProposal`: Add method to prepare for a channel proposal
- `proposeChannel`: Add method to propose a channel
- `sendToChainAddress`: Add method to send on-chain funds to an address
- `sendToChainAddresses`: Add method to send on-chain funds to multiple addresses
- `setAutopilot`: Add method to set the autopilot configuration
- `signPsbt`: Add method to sign a funded PSBT
- `subscribeToBlocks`: Add method to subscribe to blockchain progression
- `subscribeToChainAddress`: Add method to subscribe to chain address events
- `subscribeToChainSpend`: Add metthod to subscribe to chain UTXO spend events
- `subscribeToTransactions`: Add method to subscribe to local on-chain transactions
- `unlockUtxo`: Add method to release a lease on an unspent coin
- `updateChainTransaction`: Add method to update metadata on a chain tx

## 3.2.21

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
