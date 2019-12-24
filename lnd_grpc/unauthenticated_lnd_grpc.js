const {join} = require('path');

const grpc = require('grpc');
const {loadSync} = require('@grpc/proto-loader');

const {defaultSocket} = require('./grpc_services');
const grpcOptions = require('./grpc_options');
const grpcSsl = require('./grpc_ssl');
const {grpcSslCipherSuites} = require('./grpc_services');
const {packageTypes} = require('./grpc_services');
const {protoFiles} = require('./grpc_services');
const {protosDir} = require('./grpc_services');

const {GRPC_SSL_CIPHER_SUITES} = process.env;
const service = 'WalletUnlocker';

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
      unlocker: <Unlocker LND GRPC Api Object>
    }
  }
*/
module.exports = ({cert, socket}) => {
  const credentials = grpcSsl({cert}).ssl;
  const lndSocket = socket || defaultSocket;
  const protoPath = join(__dirname, protosDir, protoFiles[service]);

  const rpc = grpc.loadPackageDefinition(loadSync(protoPath, grpcOptions));

  // Exit early when cert passing with unexpected GRPC_SSL_CIPHER_SUITES type
  if (!!cert && GRPC_SSL_CIPHER_SUITES !== grpcSslCipherSuites) {
    process.env.GRPC_SSL_CIPHER_SUITES = grpcSslCipherSuites;
  }

  const lnd = new rpc[packageTypes[service]][service](lndSocket, credentials);

  return {lnd: {unlocker: lnd}};
};
