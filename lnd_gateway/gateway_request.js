const asyncAuto = require('async/auto');
const {decodeFirst} = require('cbor');
const {encodeAsync} = require('cbor');
const {returnResult} = require('asyncjs-util');

const cborContentType = 'application/cbor';
const defaultRequestTimeoutMs = 1000 * 25;
const errKey = 'err';
const gatewayGrpcMethod = 'POST';
const {keys} = Object;
const okStatusCode = 200;
const pathSeparator = '/';
const resKey = 'res';
const timeoutCode = 'ETIMEDOUT';

/** Make a request to the gateway

  {
    [bearer]: <Bearer Authentication Token String>
    call: {
      method: <Call Method String>
      params: <Call Arguments Object>
      server: <Call Server String>
    }
    request: <Request Function>
    url: <LND Gateway URL String>
  }

  @returns via cbk or Promise
  <gRPC Result Object>
*/
module.exports = ({bearer, call, request, url}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!call) {
          return cbk([400, 'ExpectedCallToMakeGatewayRequest']);
        }

        if (!call.params) {
          return cbk([400, 'ExpectedCallArgumentsToMakeGatewayRequest']);
        }

        if (!call.method) {
          return cbk([400, 'ExpectedCallMethodToMakeGatewayRequest']);
        }

        if (!call.server) {
          return cbk([400, 'ExpectedCallServerToMakeGatewayRequest']);
        }

        if (!request) {
          return cbk([400, 'ExpectedRequestFunctionToMakeGatewayRequest']);
        }

        if (!url) {
          return cbk([400, 'ExpectedUrlToMakeGatewayRequest']);
        }

        return cbk();
      },

      // Request body CBOR encoded
      encoded: ['validate', ({}, cbk) => {
        return (async () => {
          let encoded;

          try { encoded = await encodeAsync(call.params); } catch (err) {}

          if (!encoded) {
            return cbk([400, 'FailedToEncodeCborForGatewayRequest']);
          }

          return cbk(null, encoded);
        })();
      }],

      // Make request
      makeRequest: ['encoded', ({encoded}, cbk) => {
        return request({
          auth: {bearer},
          body: encoded,
          encoding: null,
          forever: true,
          headers: {'content-type': cborContentType},
          method: gatewayGrpcMethod,
          timeout: defaultRequestTimeoutMs,
          uri: [url, call.server, call.method].join(pathSeparator),
        },
        (err, response, encoded) => {
          if (!!err && err.code === timeoutCode && !!err.connect) {
            return cbk([503, 'FailedToConnectToLndGatewayServer']);
          }

          if (!!err && err.code === timeoutCode) {
            return cbk([503, 'LndGatewayServerFailedToRespondBeforeTimeout']);
          }

          if (!!err) {
            return cbk([503, 'UnexpectedErrorFromLndGatewayServer', {err}]);
          }

          if (!response) {
            return cbk([503, 'UnexpectedEmptyResponseFromLndGatewayServer']);
          }

          const {statusCode} = response;

          if (statusCode !== okStatusCode) {
            return cbk([503, 'UnexpectedGatewayStatus', {code: statusCode}]);
          }

          if (!Buffer.isBuffer(encoded)) {
            return cbk([503, 'UnexpectedNontBufferResponseFromLndGateway']);
          }

          return cbk(null, encoded);
        });
      }],

      // Decode result
      decodeResult: ['makeRequest', ({makeRequest}, cbk) => {
        return decodeFirst(makeRequest, (err, decoded) => {
          if (!!err) {
            return cbk([503, 'UnexpectedErrDecodingGatewayResponse']);
          }

          if (!keys(decoded).find(n => n === errKey)) {
            return cbk([503, 'ExpectedErrorAttributeInGatewayResponse']);
          }

          if (!keys(decoded).find(n => n === resKey)) {
            return cbk([503, 'ExpectedResponseAttributeInGatewayResponse']);
          }

          return cbk(decoded.err, decoded.res);
        });
      }],
    },
    returnResult({reject, resolve, of: 'decodeResult'}, cbk));
  });
};
