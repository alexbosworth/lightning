const {authenticatedLndGrpc} = require('./../lnd_grpc');
const executeRequest = require('./execute_request');
const returnResponse = require('./return_response');
const {unauthenticatedLndGrpc} = require('./../lnd_grpc');

const defaultSocket = '127.0.0.1:10009';

/** Send response to call from gRPC

  {
    credentials: {
      [cert]: <Base64 or Hex Serialized LND TLS Cert String>
      [socket]: <Host:Port Network Address String>
    }
  }

  @returns
  {
    middleware: <Middleware Function>
  }
*/
module.exports = ({credentials}) => {
  const middleware = ({body, params}, res) => {
    const {cert} = credentials;
    const macaroon = !!res.locals.auth ? res.locals.auth.bearer : undefined;
    const socket = credentials.socket || defaultSocket;

    const makeLnd = !!macaroon ? authenticatedLndGrpc: unauthenticatedLndGrpc;

    const {lnd} = makeLnd({cert, macaroon, socket});

    return executeRequest({
      lnd,
      method: params.method,
      params: body,
      service: params.service,
    },
    returnResponse({res}).responder);
  };

  return {middleware};
};
