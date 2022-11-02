# Versions

## 6.2.7

- `getWalletInfo`: Add support for LND 0.14.5

## 6.2.6

- `getWalletInfo`: Add support for LND 0.15.4

## 6.2.5

- Fix errors with LND API changes to HTLC events

## 6.2.4

- `getWalletInfo`: Add support for LND 0.15.3

## 6.2.3

- `getWalletInfo`: Add support for LND 0.14.4

## 6.2.2

- `getWalletInfo`: Add support for LND 0.15.2

## 6.2.1

- `openChannel`, `openChannels`: Add `base_fee_mtokens`, `fee_rate` to set
    initial routing fee rate.

## 6.1.2

- `subscribeToRpcRequests`: Fix support for LND 0.15.1

## 6.1.1

- `subscribeToPayments`: Add method to listen to all outgoing payments

## 6.0.0

### Breaking Changes

- Node.js version 14 or higher is now required

## 5.21.2

- `getChainFeeEstimate`: Add support for specifying min `utxo_confirmations`

## 5.20.2

- `getWalletInfo`: Add support for detecting lnd versions 0.15.0 and 0.15.1

## 5.20.1

- Update typescript definitions

## 5.20.0

- `getLockedUtxos`: Add support for returning script, value of locked utxos

## 5.19.0

- `closeChannel`: Add support for `max_tokens_per_vbyte` to set max fee rate
- `getChainTransactions`: Add `inputs` support for previous outpoints
- `subscribeToTransactions`: Add `inputs` support for previous outpoints

## 5.18.0

- `signBytes`: Add `type` and support for specifying `schnorr` type signing
- `verifyBytesSignature`: Add support for verifying Schnorr signatures

## 5.17.0

- `getChannels`: Add support for `is_trusted_funding` and `other_ids`
- `getClosedChannels`: Add support for `other_ids`
- `getEphemeralChannelIds`: Add method to get other channel ids
- `openChannels`: Add support for `is_trusted_funding` for instant opening
- `subscribeToChannels`: Add support for `is_trusted_funding`, `other_ids`
- `subscribeToOpenRequests`: Add support for `is_trusted_funding`

## 5.16.6

- `subscribeToInvoices`: Cancel subscription when there are no event listeners

## 5.16.4

- `signTransaction`: Add `root_hash` to support Taproot signatures with scripts

## 5.15.2

- `getFailedPayments`, `getPayments`, `getPendingPayments`: Remove
    `confirmed_at` date when a payment is not confirmed, add `created_at` and
    `failed_at` dates for attempt start and attempt failed dates.

## 5.15.0

- `beginGroupSigningSession`: Add method to start a MuSig2 signing session
- `endGroupSigningSession`: Add method to complete a MuSig2 signing session
- `updateGroupSigningSession`: Add method to add nonces to a MuSig2 session

## 5.14.0

- `getRouteToDestination`, `isDestinationPayable`, `pay`,
    `payViaPaymentDetails`, `payViaPaymentRequest`, `probeForRoute`,
    `subscribeToPayViaDetails`, `subscribeToPayViaRequest`,
    `subscribeToProbeForRoute` - add support for pathfinding `confidence`

## 5.13.1

- `signTransaction`: Fix multi-input signing for upcoming Taproot API changes

## 5.13.0

- `addExternalSocket`: Add method to add a socket to graph announcements
- `removeExternalSocket`: Add method to remove sockets from graph announcements

## 5.12.0

- `getWalletVersion`: Add support for LND 0.14.3-beta

## 5.11.0

- `updateAlias`: Add method to update the node graph announcement alias
- `updateColor`: Add method to update the node graph announcement color

## 5.10.1

- Always use TLV when paying along routes

## 5.10.0

- `signTransaction`: Add `spending` attribute for specifying external inputs

## 5.9.1

- `createChainAddress`: Add support for creating P2TR addresses
- `getUtxos`: Add support for showing P2TR address types

## 5.8.6

- `getWalletInfo`, `payViaPaymentDetails`: Correct typescript fields

## 5.8.3

- `getInvoice`: Add typescript timeout field on individual payment HTLCs

## 5.8.2

- `getMasterPublicKeys`: Add method to lookup wallet extended public keys

## 5.7.1

- `fundPsbt`: Correct ECPair import dependency in control flow

## 5.7.0

- `getPendingPayments`: Add method to get a list of in-flight payments

## 5.6.3

- `payViaRoutes`, `subscribeToPayViaRoutes`: Add support for relay messages

## 5.5.0

- `partiallySignPsbt`: Add method to partially sign a PSBT

## 5.4.2

- `deletePendingChannel`: Add method to delete a stuck pending channel
- `getInvoices`: Fill in type definition for `is_unconfirmed`

## 5.3.4

- `getPayments`: Correct paging issue that prevented paging through all results

## 5.3.3

- `pay`, `payViaPaymentRequest`: Fix support for `outgoing_channels` constraint

## 5.3.1

- `getInvoices`: Add `is_unconfirmed` to filter out canceled/settled invoices

## 5.2.1

- `getPendingChannels`: Add support for channel `capacity`

## 5.1.1

- `openChannels`: Fix `cooperative_close_address` not being set on channels

## 5.1.0

- Add support for LND 0.14.1
- `openChannels`: Add `is_avoiding_broadcast` to avoid all funding broadcast

## 5.0.1

- `createChainAddress`: Fix type hints to reflect optionality of `format`

## 5.0.0

- Removed support for determining the type of channel to support LND 0.14.0.

- `createChainAddress`: Make address format optional and add p2wpkh as default
- `sendToChainOutputScripts`: Fix specification of `fee_tokens_per_vbyte`

### Breaking Changes

- `getChannels`, `getPendingChannels`, `subscribeToChannels`: Remove
    attributes `is_anchor`, `is_static_remote_key`, `is_variable_remote_key`.

## 4.14.4

- `getPayment`, `subscribeToPastPayment`: Add `pending` for pending payment details

## 4.13.3

- Add `sendMessageToPeer` to send a peer to peer message to a connected peer
- Add `subscribeToPeerMessages` to listen to messages from connected peers

## 4.12.2

- `probeForRoute`, `subscribeToProbeForRoute`, `subscribeToPayViaRoutes`,
    `payViaRoutes`: When probing (no hash), delete the payment failure record after the probe

## 4.11.1

- `getFailedPayments`: Add method to get past failed payments
- `subscribeToRpcRequests`: Add method to listen to and interact with RPC requests

## 4.10.7

- `getPayment`: Expand type definitions to match result data

## 4.10.5

- `getInvoice`, `getInvoices`, `subscribeToInvoice`, `subscribeToInvoices`:
    Fix `payment` being set when undefined, correct `is_push` for AMP pushes

## 4.10.3

- `grantAccess`: Fix support for non-working methods

## 4.10.1

- `getWalletVersion`: Add support for LND v0.13.3-beta

## 4.10.0

- `getChannels`: Add `past_states` to reflect the number of updates
- `subscribeToChannels`: Add `past_states` to reflect to number of updates

## 4.9.0

- `grantAccess`: Add support for specifying `methods` for permissions

## 4.8.0

- `updateRoutingFees`: Add `failures` to indicate failed policy updates
- `verifyAccess`: Add method to confirm a macaroon has given permissions

## 4.7.2

- `getPayment`: Add `created_at` to indicate the creation date of the payment
- `getPayment`: Add `request` to indicate serialized payment request
- `subscribeToPastPayment`: Add `created_at` to indicate the creation date of the payment
- `subscribeToPastPayment`: Add `request` to indicate serialized payment request
- `subscribeToPastPayments`: Add `created_at` to indicate the creation date of the payment
- `subscribeToPastPayments`: Add `request` to indicate serialized payment request

## 4.6.0

- `getPayment`: Add `destination` to indicate the destination of the payment
- `subscribeToPastPayment`: Add `destination` to indicate the destination of the payment
- `subscribeToPastPayments`: Add `destination` to indicate the destination of the payment

## 4.5.0

- `deletePayment`: Add method to delete a single payment
- `deleteFailedPayAttempts`: Add `id` argument to delete failed attempts for a payment
- `getWalletStatus`: `is_ready`: Add wallet server ready status
- `subscribeToWalletStatus`: Add `ready` event to indicate server ready status

## 4.4.0

- `getPayment`: Add `confirmed_at` to indicate when payment resolved successfully
- `getPayments`: Add `confirmed_at` to indicate when payments resolve successfully
- `pay`: Add `confirmed_at` to indicate when payment resolved successfully
- `payViaPaymentDetails`: Add `confirmed_at` to indicate when payment was sent
- `payViaPaymentRequest`: Add `confirmed_at` to indicate when payment was sent
- `payViaRoutes`: Add `confirmed_at` to indicate when payment resolved successfully
- `subscribeToPastPayment`: Add `confirmed_at` to indicate when payment succeeded
- `subscribeToPastPayments`: Add `confirmed_at` to indicate when payments succeed
- `subscribeToPayViaDetails`: Add `confirmed_at` to indicate when payment was sent
- `subscribeToPayViaRequest`: Add `confirmed_at` to indicate when payment was sent
- `subscribeToPayViaRoutes`: Add `confirmed_at` to indicate when payment was sent

## 4.3.1

- `getPendingChannels`: Add typescript annotations to result

## 4.3.0

- `getPendingChannels`: Add `is_timelocked` and `timelock_blocks` to force closes

## 4.2.1

- `getChannelBalance`: Corrrect typescript type for `unsettled_balance_mtokens`
- `subscribeToProbeForRoute`: Correct typescript type for `base_fee_mtokens`

## 4.2.0

- `subscribeToPastPayments`: Add method to subscribe to successful past payments

## 4.1.3

- `lockUtxo`: Fix issue when specifying the lock id, use correct encoding of id argument

## 4.1.2

- `lockUtxo`: Return correct error message when attempting to lock an unknown UTXO

## 4.1.1

- Switch to `sendToRouteV2` to execute payments over a specific route

## 4.1.0

- `getLockedUtxos`: Add method to list locked UTXOs
- `getRouteConfidence`: Add method to check confidence on a path
- `getTowerServerInfo`: Add method to lookup watchtower server info
- `requestChainFeeIncrease`: Add method to add a CPFP request for a UTXO
- `sendToChainOutputScripts`: Add method to send chain funds to multiple outputs
- `subscribeToPeers`: Add method to get notified of peer connects and disconnects

## 4.0.0

- `getWalletStatus`: Add method to query the current wallet state

### Breaking Changes

- Node.js version 12 or higher is now required

## 3.5.0

- `changePassword`: Add method to update the wallet password
- `createSeed`: Add method to generate a wallet seed
- `createWallet`: Add method to make a new wallet
- `deleteFailedPayAttempts`: Add method to remove failed payment attempt data
- `deleteFailedPayments`: Add method to remove failed payment data
- `disableChannel`: Add method to mark a channel as forwarding disabled
- `disconnectWatchtower`: Add method to remove a connected watchtower
- `enableChannel`: Add method to signal forwarding enabled to a peer
- `getConnectedWatchtowers`: Add method to list watchtowers that are connected
- `getPathfindingSettings`: Add method to fetch configuration for pathfinding
- `isDestinationPayable`: Add method to deterrmine if a destination can be paid
- `probeForRoute`: Add method to probe to find a route to a destination
- `subscribeToWalletStatus`: Add method to get updated on wallet lock status
- `unlockWallet`: Add method to decrypt and start a wallet
- `updateConnectedWatchtower`: Add method to edit a connected watchtower
- `updatePathfindingSettings`: Add method to edit route finding heuristic configuration

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
