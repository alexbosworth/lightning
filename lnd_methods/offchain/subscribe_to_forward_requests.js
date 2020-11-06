const EventEmitter = require('events');

const {forwardPaymentActions} = require('./payment_states');
const {isLnd} = require('./../../lnd_requests');
const {rpcForwardAsForwardRequest} = require('./../../lnd_responses');

const bufferFromHex = hex => Buffer.from(hex, 'hex');
const event = 'forward_request';
const method = 'htlcInterceptor';
const type = 'router';

/** Subscribe to requests to forward payments

  Note that the outbound channel is only the requested channel, another may be
  selected internally to complete the forward.

  Requires `offchain:read`, `offchain:write` permission

  `onion` is not supported in LND 0.11.1 and below

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
    cltv_delta: <Difference Between Out and In CLTV Height Number>
    fee: <Routing Fee Tokens Rounded Down Number>
    fee_mtokens: <Routing Fee Millitokens String>
    hash: <Payment Hash Hex String>
    in_channel: <Inbound Standard Format Channel Id String>
    in_payment: <Inbound Channel Payment Id Number>
    messages: [{
      type: <Message Type Number String>
      value: <Raw Value Hex String>
    }]
    mtokens: <Millitokens to Forward To Next Peer String>
    [onion]: <Hex Serialized Next-Hop Onion Packet To Forward String>
    out_channel: <Requested Outbound Channel Standard Format Id String>
    reject: <Reject Forward Function> () => {}
    settle: <Short Circuit Function> ({secret: <Preimage Hex String}) => {}
    timeout: <CLTV Timeout Height Number>
    tokens: <Tokens to Forward to Next Peer Rounded Down Number>
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
        cltv_delta: request.cltv_delta,
        fee: request.fee,
        fee_mtokens: request.fee_mtokens,
        hash: request.hash,
        in_channel: request.in_channel,
        in_payment: request.in_payment,
        messages: request.messages,
        mtokens: request.mtokens,
        onion: request.onion,
        out_channel: request.out_channel,
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
        tokens: request.tokens,
      });
    } catch (err) {
      return emitErr([503, err.message]);
    }
  });

  sub.on('error', err => emitErr(err));

  return emitter;
};
