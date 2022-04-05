const EventEmitter = require('events');

const {isLnd} = require('./../../lnd_requests');
const {rpcConfAsConfirmation} = require('./../../lnd_responses');
const scriptFromChainAddress = require('./script_from_chain_address');

const bufferAsHex = buffer => buffer.toString('hex');
const defaultMinConfirmations = 1;
const dummyTxId = Buffer.alloc(32).toString('hex');
const events = ['confirmation', 'reorg'];
const hexAsBuffer = hex => Buffer.from(hex, 'hex');
const {isBuffer} = Buffer;
const method = 'registerConfirmationsNtfn';
const shutDownMessage = 'chain notifier shutting down';
const sumOf = arr => arr.reduce((sum, n) => sum + n, Number());
const type = 'chain';

/** Subscribe to confirmation details about transactions sent to an address

  One and only one chain address or output script is required

  Requires LND built with `chainrpc` build tag

  Requires `onchain:read` permission

  {
    [bech32_address]: <Address String>
    lnd: <Authenticated LND API Object>
    [min_confirmations]: <Minimum Confirmations Number>
    min_height: <Minimum Transaction Inclusion Blockchain Height Number>
    [output_script]: <Output Script Hex String>
    [p2pkh_address]: <Address String>
    [p2sh_address]: <Address String>
    [transaction_id]: <Blockchain Transaction Id String>
  }

  @throws
  <Error>

  @returns
  <EventEmitter Object>

  @event 'confirmation'
  {
    block: <Block Hash Hex String>
    height: <Block Best Chain Height Number>
    transaction: <Raw Transaction Hex String>
  }

  @event 'reorg'
*/
module.exports = args => {
  let outputScript = args.output_script;

  if (!isLnd({method, type, lnd: args.lnd})) {
    throw new Error('ExpectedLndGrpcApiToSubscribeToChainTransaction');
  }

  if (!args.min_height) {
    throw new Error('ExpectedMinHeightToSubscribeToChainAddress');
  }

  if (!args.output_script) {
    if (!args.bech32_address && !args.p2sh_address && !args.p2pkh_address) {
      throw new Error('ExpectedChainAddressToSubscribeForConfirmationEvents');
    }

    const {script} = scriptFromChainAddress({
      bech32_address: args.bech32_address,
      p2pkh_address: args.p2pkh_address,
      p2sh_address: args.p2sh_address,
    });

    if (!script) {
      throw new Error('ExpectedRecognizedAddressFormatToWatchForScript');
    }

    outputScript = script;
  }

  const eventEmitter = new EventEmitter();

  const sub = args.lnd[type][method]({
    height_hint: args.min_height,
    num_confs: args.min_confirmations || defaultMinConfirmations,
    script: hexAsBuffer(outputScript),
    txid: hexAsBuffer(args.transaction_id || dummyTxId).reverse(),
  });

  // Cancel the subscription when all listeners are removed
  eventEmitter.on('removeListener', () => {
    const listenerCounts = events.map(n => eventEmitter.listenerCount(n));

    // Exit early when there are still listeners
    if (!!sumOf(listenerCounts)) {
      return;
    }

    sub.cancel();

    return;
  });

  sub.on('end', () => eventEmitter.emit('end'));
  sub.on('status', n => eventEmitter.emit('status', n));

  sub.on('error', err => {
    if (err.details === shutDownMessage) {
      sub.removeAllListeners();
    }

    if (!eventEmitter.listenerCount('error')) {
      return;
    }

    eventEmitter.emit('error', err);

    return;
  });

  sub.on('data', data => {
    try {
      const event = rpcConfAsConfirmation(data);

      return !event.type ? null : eventEmitter.emit(event.type, event.data);
    } catch (err) {
      return eventEmitter.emit('error', err);
    }

    return;
  });

  return eventEmitter;
};
