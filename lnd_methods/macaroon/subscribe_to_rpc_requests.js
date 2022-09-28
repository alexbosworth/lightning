const EventEmitter = require('events');
const {randomBytes} = require('crypto');

const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {emitSubscriptionError} = require('./../../grpc');
const {handleRemoveListener} = require('./../../grpc');
const handleRpcRequestUpdate = require('./handle_rpc_request_update');
const {isLnd} = require('./../../lnd_requests');

const makeId = () => randomBytes(32).toString('hex');
const method = 'RegisterRPCMiddleware';
const minIdLength = 5;
const type = 'default';

/** Subscribe to RPC requests and their responses

  `accept` and `reject` methods can be used with cbk or Promise syntax

  Requires `macaroon:write` permission

  LND must be running with "RPC middleware" enabled: `rpcmiddleware.enable=1`

  This method is not supported in LND 0.13.4 and below

  {
    [id]: <RPC Middleware Interception Name String>
    [is_intercepting_close_channel_requests]: <Intercept Channel Closes Bool>
    [is_intercepting_open_channel_requests]: <Intercept Channel Opens Bool>
    [is_intercepting_pay_via_routes_requests]: <Intercept Pay Via Route Bool>
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk or Promise
  {
    subscription: <RPC Request Subscription EventEmitter Object>
  }

  // A channel close request was intercepted: by default it will be rejected
  @event 'close_channel_request'
  {
    accept: ({}, [cbk]) => {}
    id: <Message Id Number>
    macaroon: <Base64 Encoded Macaroon String>
    reject: ({message: <Rejection String>}, [cbk]) => {}
    request: {
      [address]: <Request Sending Local Channel Funds To Address String>
      [is_force_close]: <Is Force Close Bool>
      [target_confirmations]: <Confirmation Target Number>
      [tokens_per_vbyte]: <Tokens Per Virtual Byte Number>
      transaction_id: <Transaction Id Hex String>
      transaction_vout: <Transaction Output Index Number>
    }
    uri: <RPC URI String>
  }

  // A channel open request was intercepted: by default it will be rejected
  @event 'open_channel_request'
  {
    accept: ({}, [cbk]) => {}
    id: <Message Id Number>
    macaroon: <Base64 Encoded Macaroon String>
    reject: ({message: <Rejection String>}, [cbk]) => {}
    request: {
      [chain_fee_tokens_per_vbyte]: <Chain Fee Tokens Per VByte Number>
      [cooperative_close_address]: <Prefer Cooperative Close To Address String>
      [give_tokens]: <Tokens to Gift To Partner Number>
      [is_private]: <Channel is Private Bool>
      local_tokens: <Local Tokens Number>
      [min_confirmations]: <Spend UTXOs With Minimum Confirmations Number>
      [min_htlc_mtokens]: <Minimum HTLC Millitokens String>
      partner_public_key: <Public Key Hex String>
      [partner_csv_delay]: <Peer Output CSV Delay Number>
    }
    uri: <RPC URI String>
  }

  // A pay to route request was intercepted: by default it will be rejected
  @event 'pay_via_route_request'
  {
    accept: ({}, [cbk]) => {}
    id: <Message Id Number>
    macaroon: <Base64 Encoded Macaroon String>
    reject: ({message: <Rejection String>}, [cbk]) => {}
    request: {
      id: <Payment Hash Hex String>
      route: {
        fee: <Route Fee Tokens Number>
        fee_mtokens: <Route Fee Millitokens String>
        hops: [{
          channel: <Standard Format Channel Id String>
          channel_capacity: <Channel Capacity Tokens Number>
          fee: <Fee Tokens Number>
          fee_mtokens: <Fee Millitokens String>
          forward: <Forward Tokens Number>
          forward_mtokens: <Forward Millitokens String>
          public_key: <Forward Edge Public Key Hex String>
          [timeout]: <Timeout Block Height Number>
        }]
        mtokens: <Total Fee-Inclusive Millitokens String>
        [payment]: <Payment Identifier Hex String>
        [timeout]: <Timeout Block Height Number>
        tokens: <Total Fee-Inclusive Tokens Number>
        [total_mtokens]: <Total Payment Millitokens String>
      }
    }
    uri: <RPC URI String>
  }

  @event 'request'
  {
    call: <Call Identifier Number>
    id: <Message Id Number>
    [macaroon]: <Base64 Encoded Macaroon String>
    [uri]: <RPC URI String>
  }

  @event 'response'
  {
    call: <Call Identifier Number>
    id: <Message Id Number>
    [macaroon]: <Base64 Encoded Macaroon String>
    [uri]: <RPC URI String>
  }
*/
module.exports = (args, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!!args.id && args.id.length < minIdLength) {
          return cbk([400, 'ExpectedLongerIdLengthToSpecifyMiddlewareName']);
        }

        if (!isLnd({method, type, lnd: args.lnd})) {
          return cbk([400, 'ExpectedLndToSubscribeToRpcRequests']);
        }

        return cbk();
      },

      // Initialize subscription
      init: ['validate', ({}, cbk) => {
        const emitter = new EventEmitter();
        const isInterceptCloses = args.is_intercepting_close_channel_requests;
        const isInterceptOpens = args.is_intercepting_open_channel_requests;
        const isInterceptRoute = args.is_intercepting_pay_via_routes_requests;
        const subscription = args.lnd[type][method]({});

        const events = [
          'close_channel_request',
          'open_channel_request',
          'pay_via_route_request',
          'request',
          'response',
        ];

        const errored = emitSubscriptionError({emitter, subscription});

        // Terminate subscription when all listeners are removed
        handleRemoveListener({subscription, emitter, events});

        subscription.on('end', () => emitter.emit('end'));
        subscription.on('error', err => errored(err));
        subscription.on('status', n => emitter.emit('status', n));

        subscription.on('data', update => {
          // Exit early on notification of registration complete
          if (update.intercept_type === 'reg_complete') {
            return;
          }

          try {
            const {accept, data, event} = handleRpcRequestUpdate({
              subscription,
              update,
              is_intercepting_close_channel_requests: isInterceptCloses,
              is_intercepting_open_channel_requests: isInterceptOpens,
              is_intercepting_pay_via_routes_requests: isInterceptRoute,
              lnd: args.lnd,
            });

            // Notify listeners of the RPC update
            emitter.emit(event, data);

            // Exit early when accepting/rejecting is left to the caller
            if (!accept) {
              return;
            }

            // Accept traffic by default
            return accept({}, err => !!err ? errored(err) : undefined);
          } catch (err) {
            return errored([503, err.message]);
          }
        });

        return cbk(null, {emitter, subscription});
      }],

      // Start the interception of RPC requests
      intercept: ['init', ({init}, cbk) => {
        return init.subscription.write({
          register: {
            middleware_name: args.id || makeId(),
            read_only_mode: true,
          },
        },
        err => {
          if (!!err) {
            return cbk([503, 'UnexpectedErrInterceptingRpcRequests', {err}]);
          }

          return cbk(null, {subscription: init.emitter});
        });
      }],
    },
    returnResult({reject, resolve, of: 'intercept'}, cbk));
  });
};
