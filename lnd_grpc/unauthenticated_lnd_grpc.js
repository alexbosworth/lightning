const {join} = require('path');

const grpc = require('@grpc/grpc-js');
const {loadSync} = require('@grpc/proto-loader');

const {defaultSocket} = require('./../grpc');
const grpcOptions = require('./grpc_options');
const grpcSsl = require('./grpc_ssl');
const {grpcSslCipherSuites} = require('./../grpc');
const {packageTypes} = require('./../grpc');
const {protoFiles} = require('./../grpc');
const {protosDir} = require('./../grpc');
const {unauthenticatedServiceTypes} = require('./../grpc');

const {GRPC_SSL_CIPHER_SUITES} = process.env;
const {keys} = Object;

/** Unauthenticated gRPC interface to the Lightning Network Daemon (lnd).

  Make sure to provide a cert when using LND with its default self-signed cert

  {
    [cert]: <Base64 or Hex Serialized LND TLS Cert String>
    [socket]: <Host:Port String>
  }

  @throws
  <Error>

  @returns
  {
    lnd: {
      status: <Status LND API Object>
      unlocker: <Unlocker LND API Object>
    }
  }
*/
module.exports = ({cert, socket}) => {
  const credentials = grpcSsl({cert}).ssl;
  const lndSocket = socket || defaultSocket;

  if (!!cert && GRPC_SSL_CIPHER_SUITES !== grpcSslCipherSuites) {
    process.env.GRPC_SSL_CIPHER_SUITES = grpcSslCipherSuites;
  }

  // Assemble different services from their proto files
  return {
    lnd: keys(unauthenticatedServiceTypes).reduce((services, type) => {
      const service = unauthenticatedServiceTypes[type];

      const protoPath = join(__dirname, protosDir, protoFiles[service]);

      const rpc = grpc.loadPackageDefinition(loadSync(protoPath, grpcOptions));

      services[type] = new rpc[packageTypes[service]][service](
        lndSocket,
        credentials
      );

      return services;
    },
    {}),
  };
};
