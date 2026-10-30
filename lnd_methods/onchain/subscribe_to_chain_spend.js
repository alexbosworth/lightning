const EventEmitter = require('events');

const {emitSubscriptionEvent} = require('./../../grpc');
const {isLnd} = require('./../../lnd_requests');
const {rpcSpendAsConfirmation} = require('./../../lnd_responses');
const scriptFromChainAddress = require('./script_from_chain_address');

const dummyTxId = Buffer.alloc(32).toString('hex');
const events = ['confirmation', 'reorg'];
const hexAsBuffer = hex => Buffer.from(hex, 'hex');
const method = 'registerSpendNtfn';
const shutDownMessage = 'chain notifier shutting down';
const sumOf = arr => arr.reduce((sum, n) => sum + n, Number());
const type = 'chain';

/** Subscribe to confirmations of a spend

  A chain address or raw output script is required

  When specifying a P2TR output script, `transaction_id` and `transaction_vout`
  are required.

  Requires LND built with `chainrpc` build tag

  Requires `onchain:read` permission

  Subscribing to P2TR outputs is not supported in LND 0.14.5 and below

  {
    [bech32_address]: <Bech32 P2WPKH or P2WSH Address String>
    lnd: <Authenticated LND API Object>
    min_height: <Minimum Transaction Inclusion Blockchain Height Number>
    [output_script]: <Output Script AKA ScriptPub Hex String>
    [p2pkh_address]: <Pay to Public Key Hash Address String>
    [p2sh_address]: <Pay to Script Hash Address String>
    [transaction_id]: <Blockchain Transaction Id Hex String>
    [transaction_vout]: <Blockchain Transaction Output Index Number>
  }

  @throws
  <Error>

  @returns
  <EventEmitter Object>

  @event 'confirmation'
  {
    height: <Confirmation Block Height Number>
    transaction: <Raw Transaction Hex String>
    vin: <Spend Outpoint Index Number>
  }

  @event 'reorg'
*/
module.exports = args => {
  if (!isLnd({method, type, lnd: args.lnd})) {
    throw new Error('ExpectedLndGrpcApiToSubscribeToSpendConfirmations');
  }

  if (!args.min_height) {
    throw new Error('ExpectedMinHeightToSubscribeToChainSpend');
  }

  const {script} = scriptFromChainAddress({
    bech32_address: args.bech32_address,
    p2pkh_address: args.p2pkh_address,
    p2sh_address: args.p2sh_address,
  });

  if (!script && !args.output_script) {
    throw new Error('ExpectedRecognizedAddressFormatToWatchForSpend');
  }

  const eventEmitter = new EventEmitter();

  const subscription = args.lnd[type][method]({
    outpoint: {
      hash: hexAsBuffer(args.transaction_id || dummyTxId).reverse(),
      index: args.transaction_vout || Number(),
    },
    height_hint: args.min_height || Number(),
    script: hexAsBuffer(script || args.output_script),
  });

  // Cancel the subscription when all listeners are removed
  eventEmitter.on('removeListener', () => {
    const listenerCounts = events.map(n => eventEmitter.listenerCount(n));

    // Exit early when there are still listeners
    if (!!sumOf(listenerCounts)) {
      return;
    }

    subscription.cancel();

    return;
  });

  const emitError = err => {
    // Exit early when there are no error listeners
    if (!eventEmitter.listenerCount('error')) {
      return;
    }

    return eventEmitter.emit('error', err);
  };

  subscription.on('end', () => eventEmitter.emit('end'));
  subscription.on('status', n => eventEmitter.emit('status', n));

  subscription.on('error', err => {
    if (err.details === shutDownMessage) {
      subscription.removeAllListeners();
    }

    return emitError(err);
  });

  subscription.on('data', data => {
    try {
      const event = rpcSpendAsConfirmation(data);

      return emitSubscriptionEvent({
        data: event.data,
        emitter: eventEmitter,
        event: event.type,
      });
    } catch (err) {
      return emitError(err);
    }
  });

  return eventEmitter;
};
