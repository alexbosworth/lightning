const EventEmitter = require('events');

const {forwardPaymentActions} = require('./payment_states');
const {isLnd} = require('./../../lnd_requests');
const {rpcForwardAsForwardRequest} = require('./../../lnd_responses');

const bufferFromHex = hex => Buffer.from(hex, 'hex');
const event = 'forward_request';
const method = 'htlcInterceptor';
const type = 'router';

/** Subscribe to requests to forward payments

  Requires `offchain:read`, `offchain:write` permission

  This method is not supported on LND 0.10.2 and below

  {
    lnd: <Authenticated LND API Object>
  }

  @throws
  <Error>

  @returns
  <EventEmitter Object>

  @event 'forward_request`
  {
    accept: () => {}
    hash: <Payment Hash Hex String>
    in_channel: <Inbound Standard Format Channel Id String>
    in_payment: <Inbound Channel Payment Id Number>
    mtokens: <Millitokens to Forward To Next Peer String>
    reject: <Reject Forward Function> () => {}
    settle: <Short Circuit Function> ({secret: <Preimage Hex String}) => {}
    tokens: <Tokens to Forward Rounded Down Number>
    timeout: <CLTV Timeout Height Number>
  }
*/
module.exports = ({lnd}) => {
  if (!isLnd({lnd, method, type})) {
    throw new Error('ExpectedAuthenticatedLndToSubscribeToForwardRequests');
  }

  const emitter = new EventEmitter();
  const sub = lnd[type][method]({});

  const emitErr = err => {
    if (!emitter.listenerCount('error')) {
      return;
    }

    return emitter.emit('error', err);
  };

  // Cancel the subscription when all listeners are removed
  emitter.on('removeListener', () => {
    // Exit early when there are still listeners
    if (!!emitter.listenerCount(event)) {
      return;
    }

    sub.cancel();

    return;
  });

  sub.on('data', data => {
    try {
      const request = rpcForwardAsForwardRequest(data);

      return emitter.emit(event, {
        accept: () => sub.write({
          action: forwardPaymentActions.accept,
          incoming_circuit_key: data.incoming_circuit_key,
        }),
        hash: request.hash,
        in_channel: request.in_channel,
        in_payment: request.in_payment,
        mtokens: request.mtokens,
        reject: () => sub.write({
          action: forwardPaymentActions.reject,
          incoming_circuit_key: data.incoming_circuit_key,
        }),
        settle: ({secret}) => sub.write({
          action: forwardPaymentActions.settle,
          incoming_circuit_key: data.incoming_circuit_key,
          preimage: bufferFromHex(secret),
        }),
        timeout: request.timeout,
      });
    } catch (err) {
      return emitErr([503, err.message]);
    }
  });

  sub.on('error', err => emitErr(err));

  return emitter;
};
