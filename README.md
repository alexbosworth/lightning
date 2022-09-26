# Lightning

[![npm version](https://badge.fury.io/js/lightning.svg)](https://badge.fury.io/js/lightning)

Methods for working with the Lightning Network

## Selected Projects using Lightning

- [bitpay.com crypto-rpc](https://bitpay.com/) -
    https://github.com/bitpay/crypto-rpc
- [coinos.io](https://coinos.io/) - https://github.com/coinos/coinos-server
- [Galoy](https://galoy.io/) - https://github.com/GaloyMoney/galoy
- [Lightning Poker](https://lightning-poker.com/) -
    https://github.com/igreshev/lightning-poker
- [Lightning Roulette](https://lightning-roulette.com/) -
    https://github.com/igreshev/lightning-roulette
- [Lightning Shell](https://lightningshell.app/) -
    https://github.com/ibz/lightning-shell
- [LNMarkets](https://twitter.com/lnmarkets) -
    https://github.com/lnmarkets/umbrel
- [LNPingBot](https://github.com/swissrouting/lnpingbot) - https://github.com/swissrouting/lnpingbot
- [mempool.space](https://mempool.space/) - https://github.com/mempool/mempool
- [p2plnbot](https://telegram.me/lnp2pbot) - https://github.com/grunch/p2plnbot
- [rekr](https://rekr.app/) - https://github.com/ryan-lingle/rekr
- [stackernews](https://stacker.news/) -
    https://github.com/stackernews/stacker.news
- [Suredbits API](https://suredbits.com/) -
    https://github.com/Suredbits/sb-api-lnd
- [Synonym Blocktank server](https://synonym.to) -
    https://github.com/synonymdev/blocktank-server/
- [Tarnhelm](https://www.tarnhelm.app/) - https://github.com/bkiac/tarnhelm
- [tbtcswaps](https://tbtcswaps.com/) -
    https://github.com/keep-community/tbtcswaps
- [Thunderhub](https://www.thunderhub.io/) -
    https://github.com/apotdevin/thunderhub

## LND Authentication

To connect to an LND node, authentication details are required.

Export credentials via CLI:
[balanceofsatoshis](https://github.com/alexbosworth/balanceofsatoshis):
`npm install -g balanceofsatoshis` and export via `bos credentials --cleartext`

Or export them manually:

Run `base64` on the tls.cert and admin.macaroon files to get the encoded
authentication data to create the LND connection. You can find these files in
the LND directory. (~/.lnd or ~/Library/Application Support/Lnd)

    base64 -w0 ~/.lnd/tls.cert
    base64 -w0 ~/.lnd/data/chain/bitcoin/mainnet/admin.macaroon

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

## Debugging

If you encounter any issues connecting and wish to view detailed information
about the underlying grpc calls, you can run Node with these environment
variables set:

    GRPC_VERBOSITY=DEBUG GRPC_TRACE=all node YOURSCRIPTNAME.js

## Methods

- [addExternalSocket](https://github.com/alexbosworth/ln-service#addexternalsocket):
    Add a new LN p2p network socket to node advertisement
- [addPeer](https://github.com/alexbosworth/ln-service#addpeer): Connect to a new peer
- [authenticatedLndGrpc](https://github.com/alexbosworth/ln-service#authenticatedlndgrpc): 
    Instantiate connection to authenticated lnd methods.
- [beginGroupSigningSession](https://github.com/alexbosworth/ln-service#begingroupsigningsession):
    Start a new MuSig2 signing session
- [broadcastChainTransaction](https://github.com/alexbosworth/ln-service#broadcastchaintransaction):
    Publish an on-chain transaction to the network.
- [cancelHodlInvoice](https://github.com/alexbosworth/ln-service#cancelhodlinvoice): Cancel an
    open invoice.
- [cancelPendingChannel](https://github.com/alexbosworth/ln-service#cancelpendingchannel):
    Cancel a pending channel.
- [closeChannel](https://github.com/alexbosworth/ln-service#closechannel): Close a channel out to
    the chain.
- [changePassword](https://github.com/alexbosworth/ln-service#changepassword): Update the
    wallet encryption passphrase.
- [connectWatchtower](https://github.com/alexbosworth/ln-service#connectwatchtower): Connect a
    new watchtower.
- [createChainAddress](https://github.com/alexbosworth/ln-service#createchainaddress): Generate
    a chain address to receive on-chain funds.
- [createHodlInvoice](https://github.com/alexbosworth/ln-service#createhodlinvoice): Make a new
    off-chain invoice that will not automatically accept payment.
- [createInvoice](https://github.com/alexbosworth/ln-service#createinvoice): Make a new off-chain
    invoice.
- [createSeed](https://github.com/alexbosworth/ln-service#createseed): Generate a random wallet
    HD seed.
- [createWallet](https://github.com/alexbosworth/ln-service#createwallet): Make a new wallet.
- [decodePaymentRequest](https://github.com/alexbosworth/ln-service#decodepaymentrequest):
    Get parsed details for a payment request.
- [createWallet](https://github.com/alexbosworth/ln-service#createwallet): Make a new wallet.
- [deleteFailedPayAttempts](https://github.com/alexbosworth/ln-service#deletefailedpayattempts)
    Remove failed payment paths from database.
- [deleteFailedPayments](https://github.com/alexbosworth/ln-service#deletefailedpayments)
    Remove failed payments from the database.
- [deleteForwardingReputations](https://github.com/alexbosworth/ln-service#deleteforwardingreputations)
    Clear pathfinding reputations of routing nodes and channels.
- [deletePayment](https://github.com/alexbosworth/ln-service#deletepayment): Remove a
    past payment record.
- [deletePayments](https://github.com/alexbosworth/ln-service#deletepayments): Remove all
    past payment records.
- [diffieHellmanComputeSecret](https://github.com/alexbosworth/ln-service#diffiehellmancomputesecret):
    Calculate a shared secret to enable symmetric encryption of data to another node.
- [disableChannel](https://github.com/alexbosworth/ln-service#disablechannel): Signal disabled
    forwarding to a peer
- [disconnectWatchtower](https://github.com/alexbosworth/ln-service#disconnectwatchtower):
    Remove a connected watchtower
- [enableChannel](https://github.com/alexbosworth/ln-service#enablechannel): Signal forwarding
    enabled towards a peer.
- [endGroupSigningSession](https://github.com/alexbosworth/ln-service#endgroupsigningsession):
    End a MuSig2 signing session
- [fundPendingChannels](https://github.com/alexbosworth/ln-service#fundpendingchannels):
    Provide a signed funding source for opening channels.
- [fundPsbt](https://github.com/alexbosworth/ln-service#fundpsbt): Make a PSBT with funds and
    change to setup a future on-chain spend.
- [getAccessIds](https://github.com/alexbosworth/ln-service#getaccessids): List the access tokens
    granted permission to access the node.
- [getAutopilot](https://github.com/alexbosworth/ln-service#getautopilot): Retrieve channel open
    autopilot configuration.
- [getBackup](https://github.com/alexbosworth/ln-service#getbackup): Get recovery details for a
    specific channel.
- [getBackups](https://github.com/alexbosworth/ln-service#getbackups): Get recovery details for
    all channels.
- [getChainBalance](https://github.com/alexbosworth/ln-service#getchainbalance): Get the amount
    of on-chain funds.
- [getChainFeeEstimate](https://github.com/alexbosworth/ln-service#getchainfeeestimate):
    Estimate a chain fee to send funds to an address.
- [getChainFeeRate](https://github.com/alexbosworth/ln-service#getchainfeerate): Get an estimate
    for an on-chain fee rate.
- [getChainTransactions](https://github.com/alexbosworth/ln-service#getchaintransactions): List
    past on-chain transactions.
- [getChannel](https://github.com/alexbosworth/ln-service#getchannel): Lookup network graph
    details about a channel.
- [getChannelBalance](https://github.com/alexbosworth/ln-service#getchannelbalance): Calculate
    the total off-chain balance on the node.
- [getChannels](https://github.com/alexbosworth/ln-service#getchannels): List open channels on
    the node.
- [getClosedChannels](https://github.com/alexbosworth/ln-service#getclosedchannels): List closed
    channels on the node.
- [getConnectedWatchtowers](https://github.com/alexbosworth/ln-service#getconnectedwatchtowers):
    List watchtowers that were added
- [getEphemeralChannelIds](https://github.com/alexbosworth/ln-service#getephemeralchannelids):
    List other channel ids for channels
- [getFailedPayments](https://github.com/alexbosworth/ln-service#getfailedpayments): List out
    past payments that failed.
- [getFeeRates](https://github.com/alexbosworth/ln-service#getfeerates): List routing fee rates
    and routing policies of channels on the node.
- [getForwardingConfidence](https://github.com/alexbosworth/ln-service#getforwardingconfidence):
    Calculate the pathfinding confidence score for routing a payment.
- [getForwardingReputations](https://github.com/alexbosworth/ln-service#getforwardingreputations):
    List the pathfinding reputations for payment routing.
- [getForwards](https://github.com/alexbosworth/ln-service#getforwards): List past forwards routed
    through the node.
- [getHeight](https://github.com/alexbosworth/ln-service#getheight): Lookup the current best chain
    height.
- [getIdentity](https://github.com/alexbosworth/ln-service#getidentity): Derive the identity public
    key of the node.
- [getInvoice](https://github.com/alexbosworth/ln-service#getinvoice): Lookup the status of an
    invoice.
- [getInvoices](https://github.com/alexbosworth/ln-service#getinvoices): List details of all past
    open invoices and received payments.
- [getLockedUtxos](https://github.com/alexbosworth/ln-service#getlockedutxos): List the UTXOs
    that are currently reserved and unavailable to coin selection.
- [getMasterPublicKeys](https://github.com/alexbosworth/ln-service#getmasterpublickeys):
    List out master seed derived extended public keys and derivation paths.
- [getMethods](https://github.com/alexbosworth/ln-service#getmethods): List RPC methods and
    permissions required to use them.
- [getNetworkCentrality](https://github.com/alexbosworth/ln-service#getnetworkcentrality):
    Calculate the graph centrality score of a node.
- [getNetworkGraph](https://github.com/alexbosworth/ln-service#getnetworkgraph): List all graph
    routing nodes and all channels.
- [getNetworkInfo](https://github.com/alexbosworth/ln-service#getnetworkinfo): Calculate network
    graph statistics.
- [getNode](https://github.com/alexbosworth/ln-service#getnode): Retrieve graph details for a
    node and optionally list its channels.
- [getPathfindingSettings](https://github.com/alexbosworth/ln-service#getpathfindingsettings):
    List out configuration options set for routing.
- [getPayment](https://github.com/alexbosworth/ln-service#getpayment): Lookup details about a
    past payment.
- [getPayments](https://github.com/alexbosworth/ln-service#getpayments): List details about past
    payment attempts and paid payment requests.
- [getPeers](https://github.com/alexbosworth/ln-service#getpeers): List details of connected nodes.
- [getPendingChainBalance](https://github.com/alexbosworth/ln-service#getpendingchainbalance):
    Calculate the unconfirmed on-chain balance.
- [getPendingChannels](https://github.com/alexbosworth/ln-service#getpendingchannels): List
    details of opening or closing channels.
- [getPendingPayments](https://github.com/alexbosworth/ln-service#getpendingpayments): List out
    past pending payments.
- [getPublicKey](https://github.com/alexbosworth/ln-service#getpublickey): Derive a public key at
    a given index.
- [getRouteConfidence](https://github.com/alexbosworth/ln-service#getrouteconfidence): Check a
    route to see the pathfinding confidence score that a payment would succeed.
- [getRouteThroughHops](https://github.com/alexbosworth/ln-service#getroutethroughhops):
    Calculate a route through specified nodes.
- [getRouteToDestination](https://github.com/alexbosworth/ln-service#getroutetodestination):
    Calculate a route through the graph to a destination.
- [getSweepTransactions](https://github.com/alexbosworth/ln-service#getsweeptransactions): List
    transactions that are sweeping funds on-chain.
- [getTowerServerInfo](https://github.com/alexbosworth/ln-service#gettowerserverinfo): General
    information about a watchtower server running.
- [getUtxos](https://github.com/alexbosworth/ln-service#getutxos): List unspent transaction outputs
    in the on-chain wallet.
- [getWalletInfo](https://github.com/alexbosworth/ln-service#getwalletinfo): Lookup general details
    about the node.
- [getWalletStatus](https://github.com/alexbosworth/ln-service#getwalletstatus): Fetch the current
    state of the wallet.
- [getWalletVersion](https://github.com/alexbosworth/ln-service#getwalletversion): Retrieve the
    version and build tags of the node.
- [grantAccess](https://github.com/alexbosworth/ln-service#grantaccess): Create an access
    credential macaroon to access the API.
- [isDestinationPayable](https://github.com/alexbosworth/ln-service#isdestinationpayable): Check
    if a destination can be paid
- [lockUtxo](https://github.com/alexbosworth/ln-service#lockutxo): Lease a UTXO so it cannot be
    chosen to be spent.
- [openChannel](https://github.com/alexbosworth/ln-service#openchannel): Create a new channel
    to another node.
- [openChannels](https://github.com/alexbosworth/ln-service#openchannels): Open
     multiple channels in a single on-chain transaction batch.
- [partiallySignPsbt](https://github.com/alexbosworth/ln-service#partiallysignpsbt):
    Add a partial signature to a PSBT
- [pay](https://github.com/alexbosworth/ln-service#pay): Make an off-chain payment.
- [payViaPaymentDetails](https://github.com/alexbosworth/ln-service#payviapaymentdetails): Pay
    off-chain using details about a destination invoice.
- [payViaPaymentRequest](https://github.com/alexbosworth/ln-service#payviapaymentrequest):
    Pay a payment request off-chain.
- [payViaRoutes](https://github.com/alexbosworth/ln-service#payviaroutes):  Pay to a destination
    using a specified route or routes.
- [prepareForChannelProposal](https://github.com/alexbosworth/ln-service#prepareforchannelproposal):
    Prepare to receive a custom channel proposal.
- [probeForRoute](https://github.com/alexbosworth/ln-service#probeforroute): Run a probe to find a
    route to pay to a destination.
- [proposeChannel](https://github.com/alexbosworth/ln-service#proposechannel): Propose a new
    channel to a peer who has prepared for the channel proposal.
- [recoverFundsFromChannel](https://github.com/alexbosworth/ln-service#recoverfundsfromchannel):
    Attempt to recover channel funds from a specific channel backup.
- [recoverFundsFromChannels](https://github.com/alexbosworth/ln-service#recoverfundsfromchannels):
    Attempt to recover funds from multiple channels using a multiple channel backup.
- [removeExternalSocket](https://github.com/alexbosworth/ln-service#removeexternalsocket):
    Remove a LN p2p network socket from the node advertisement
- [removePeer](https://github.com/alexbosworth/ln-service#removepeer): Disconnect from a
    connected peer.
- [requestChainFeeIncrease](https://github.com/alexbosworth/ln-service#requestchainfeeincrease):
    Ask for a CPFP chain fee rate increase on a pending confirm UTXO.
- [revokeAccess](https://github.com/alexbosworth/ln-service#revokeaccess): Remove the access
    privileges of a previously issued access token macaroon credential.
- [sendMessageToPeer](https://github.com/alexbosworth/ln-service#sendmessagetopeer): Send
    message to a connected peer.
- [sendToChainAddress](https://github.com/alexbosworth/ln-service#sendtochainaddress): Send
    funds on-chain to an address.
- [sendToChainAddresses](https://github.com/alexbosworth/ln-service#sendtochainaddresses):
    Send funds on-chain to multiple chain addresses.
- [sendToChainOutputScripts](https://github.com/alexbosworth/ln-service#sendtochainoutputscripts):
    Send funds on-chain to multiple chain destinations, specifying outputs scripts, not addresses.
- [setAutopilot](https://github.com/alexbosworth/ln-service#setautopilot): Set the open channel
    autopilot configuration settings.
- [settleHodlInvoice](https://github.com/alexbosworth/ln-service#settlehodlinvoice): Take incoming
      off-chain funds when an invoice has held funds from an incoming payment.
- [signBytes](https://github.com/alexbosworth/ln-service#signbytes): Use node keys to sign over an
    arbitrary set of bytes.
- [signMessage](https://github.com/alexbosworth/ln-service#signmessage): Use the node identity
    key to generate a signed message that represents the public graph node identity.
- [signPsbt](https://github.com/alexbosworth/ln-service#signpsbt): Sign inputs and finalize a
    partially signed transaction in the PSBT format to prepare it for broadcast.
- [signTransaction](https://github.com/alexbosworth/ln-service#signtransaction): Generate
    signatures required for inputs on a transaction.
- [stopDaemon](https://github.com/alexbosworth/ln-service#stopdaemon): Send a shutdown
    request to cleanly kill the daemon.
- [subscribeToBackups](https://github.com/alexbosworth/ln-service#subscribetobackups): Get
    notified on channel funds recovery backup file updates.
- [subscribeToBlocks](https://github.com/alexbosworth/ln-service#subscribetoblocks): Get notified
    when the Blockchain is updated.
- [subscribeToChainAddress](https://github.com/alexbosworth/ln-service#subscribetochainaddress):
    Get notified when funds are sent to an on-chain address.
- [subscribeToChainSpend](https://github.com/alexbosworth/ln-service#subscribetochainspend):
    Get notified when a UTXO is spent.
- [subscribeToChannels](https://github.com/alexbosworth/ln-service#subscribetochannels): Get
    notified when the set of active channels is updated.
- [subscribeToForwardRequests](https://github.com/alexbosworth/ln-service#subscribetoforwardrequests):
    Get notified on requests to begin forward flows and interactively accept or reject or settle them.
- [subscribeToForwards](https://github.com/alexbosworth/ln-service#subscribetoforwards): Get
    notified on off-chain routed payment events.
- [subscribeToGraph](https://github.com/alexbosworth/ln-service#subscribetograph): Get notified
    of changes to the public routing graph nodes and channels.
- [subscribeToInvoice](https://github.com/alexbosworth/ln-service#subscribetoinvoice): Get notified
    of status updates for incoming payments.
- [subscribeToInvoices](https://github.com/alexbosworth/ln-service#subscribetoinvoices): Get
    notified of status updates on past created invoices.
- [subscribeToOpenRequests](https://github.com/alexbosworth/ln-service#subscribetoopenrequests):
    Get notified on requests to open an inbound channel and interactively accept or reject them.
- [subscribeToPastPayment](https://github.com/alexbosworth/ln-service#subscribetopastpayment):
    Get notified of the current and ongoing status of a past off-chain payment.
- [subscribeToPastPayments](https://github.com/alexbosworth/ln-service#subscribetopastpayments):
    Get notified of successful outgoing payments.
- [subscribeToPayViaDetails](https://github.com/alexbosworth/ln-service#subscribetopayviadetails):
    Make an off-chain payment using payment details and subscribe to the status of that payment.
- [subscribeToPayViaRequest](https://github.com/alexbosworth/ln-service#subscribetopayviarequest):
    Make an off-chain payment using a payment request and subscribe to the payment status.
- [subscribeToPayViaRoutes](https://github.com/alexbosworth/ln-service#subscribetopayviaroutes):
    Start an off-chain payment using specific payment routes and subscribe to the payment result.
- [subscribeToPayments](https://github.com/alexbosworth/ln-service#subscribetopayments):
    Subscribe to off-chain payments going out and being resolved
- [subscribeToPeerMessages](https://github.com/alexbosworth/ln-service#subscribetopeermessages):
    Listen for incoming peer messages.
- [subscribeToPeers](https://github.com/alexbosworth/ln-service#subscribetopeers): Listen to peer
    disconnect and connect events.
- [subscribeToProbeForRoute](https://github.com/alexbosworth/ln-service#subscribetoprobeforroute):
    Start an off-chain probe to find a payable route and get notified on the status of the probe.
- [subscribeToRpcRequests](https://github.com/alexbosworth/ln-service#subscribetorpcrequests):
    Intercept all incoming and outgoing traffic to the RPC
- [subscribeToTransactions](https://github.com/alexbosworth/ln-service#subscribetotransactions):
    Get notified on on-chain transaction activity.
- [subscribeToWalletStatus](https://github.com/alexbosworth/ln-service#subscribetowalletstatus):
    Listen to updates to wallet state
- [unauthenticatedLndGrpc](https://github.com/alexbosworth/ln-service#unauthenticatedlndgrpc):
    Create an lnd object for use with methods that do not require authentication credentials.
- [unlockUtxo](https://github.com/alexbosworth/ln-service#unlockutxo): Release a lease on a wallet
    UTXO to allow it to be selected for spending again.
- [unlockWallet](https://github.com/alexbosworth/ln-service#unlockwallet): Decrypt the wallet and
    start the daemon
- [updateAlias](https://github.com/alexbosworth/ln-service#updatealias):
    Update the advertised node alias
- [updateChainTransaction](https://github.com/alexbosworth/ln-service#updatechaintransaction):
    Edit the metadata of an on-chain transaction record.
- [updateColor](https://github.com/alexbosworth/ln-service#updatecolor):
    Update the advertised node color
- [updateConnectedWatchtower](https://github.com/alexbosworth/ln-service#updateconnectedwatchtower):
    Edit the settings on an added watchtower
- [updateGroupSigningSession](https://github.com/alexbosworth/ln-service#updategroupsigningsession):
    Update a MuSig2 signing session with nonces and get a partial signature
- [updatePathfindingSettings](https://github.com/alexbosworth/ln-service#updatepathfindingsettings):
    Edit the configuration for routing calculations
- [updateRoutingFees](https://github.com/alexbosworth/ln-service#updateroutingfees): Set the
    forwarding fees or other routing policies for a channel or all channels.
- [verifyAccess](https://github.com/alexbosworth/ln-service#verifyaccess): Confirm a macaroon
    has permission to access a given resource.
- [verifyBackup](https://github.com/alexbosworth/ln-service#verifybackup): Check if a channel fund
    recovery backup file is valid.
- [verifyBackups](https://github.com/alexbosworth/ln-service#verifybackups): Check if multiple
    channel fund recovery backups are valid.
- [verifyBytesSignature](https://github.com/alexbosworth/ln-service#verifybytessignature): Check
    that a signature over arbitrary bytes is valid.
- [verifyMessage](https://github.com/alexbosworth/ln-service#verifymessage): Check that a
    message from a node in the graph has a valid signature.
