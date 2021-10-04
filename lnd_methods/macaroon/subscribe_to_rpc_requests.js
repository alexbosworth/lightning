const EventEmitter = require('events');
const {randomBytes} = require('crypto');

const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {emitSubscriptionError} = require('./../../grpc');
const {handleRemoveListener} = require('./../../grpc');
const {isLnd} = require('./../../lnd_requests');
const {rpcRequestUpdateAsEvent} = require('./../../lnd_responses');

const cancelError = 'Cancelled on client';
const events = ['request', 'response'];
const makeId = () => randomBytes(32).toString('hex');
const method = 'RegisterRPCMiddleware';
const sumOf = arr => arr.reduce((sum, n) => sum + n, Number());
const type = 'default';

/** Subscribe to RPC requests and their responses

  Requires `macaroon:write` permission

  LND must be running with rpc middleware enabled: `rpcmiddleware.enable=1`

  This method is not supported in LND 0.13.3 and below

  {
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk or Promise
  {
    subscription: <RPC Request Subscription EventEmitter Object>
  }

  @event 'request'
  {
    id: <Request Id Number>
    [macaroon]: <Base64 Encoded Macaroon String>
    [uri]: <RPC URI String>
  }

  @event 'response'
  {
    id: <Request Id Number>
    [macaroon]: <Base64 Encoded Macaroon String>
    [uri]: <RPC URI String>
  }
*/
module.exports = ({lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedLndToSubscribeToRpcRequests']);
        }

        return cbk();
      },

      // Intercept RPC requests
      intercept: ['validate', ({}, cbk) => {
        const emitter = new EventEmitter();

        try {
          const subscription = lnd[type][method]({});

          subscription.write({
            register: {middleware_name: makeId(), read_only_mode: true},
          },
          err => {
            if (!!err) {
              return cbk([503, 'UnexpectedErrInterceptingRpcRequests', {err}]);
            }

            return cbk(null, {subscription: emitter});
          });

          handleRemoveListener({subscription, emitter, events});

          const errored = emitSubscriptionError({emitter, subscription});

          subscription.on('data', update => {
            try {
              const details = rpcRequestUpdateAsEvent(update);

              emitter.emit(details.event, {
                id: details.id,
                macaroon: details.macaroon,
                uri: details.uri,
              });

              return subscription.write({
                feedback: {replace_response: false},
                request_id: details.id,
              });
            } catch (err) {
              return errored([503, err.message]);
            }
          });

          subscription.on('end', () => emitter.emit('end'));
          subscription.on('error', err => errored(err));
          subscription.on('status', n => emitter.emit('status', n));
        } catch (err) {
          return cbk([503, 'UnexpectedErrorSubscribingToRpcRequests', {err}]);
        }
      }],
    },
    returnResult({reject, resolve, of: 'intercept'}, cbk));
  });
};
