const {raw} = require('body-parser');
const {Router} = require('express');

const bearerToken = require('./bearer_token');
const decodeCborBody = require('./decode_cbor_body');
const grpcResponse = require('./grpc_response');
const handleErrors = require('./handle_errors');

const caseSensitive = true;
const cborType = 'application/cbor';
const path = '/:service/:method';
const strict = true;

/** Get a gRPC gateway router

  {
    [cert]: <Base64 or Hex Serialized LND TLS Cert String>
    [socket]: <Host:Port Network Address String>
  }

  @returns
  <Router Object>
*/
module.exports = ({cert, socket}) => {
  const credentials = {cert, socket};
  const router = Router({caseSensitive, strict});

  // Parse out the bearer token
  router.use(bearerToken({}).middleware);

  // Decode body into binary buffer
  router.use(raw({type: cborType}));

  // Decode CBOR binary body into object
  router.use(decodeCborBody({}).middleware);

  // Proxy CBOR arguments into an LND request
  router.post(path, grpcResponse({credentials}).middleware);

  // Handle any errors that pop up along the way
  router.use(handleErrors({}).middleware);

  return router;
};

