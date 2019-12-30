const {join} = require('path');

const grpc = require('grpc');
const {loadSync} = require('@grpc/proto-loader');

const {defaultSocket} = require('./../grpc');
const grpcCredentials = require('./grpc_credentials');
const grpcOptions = require('./grpc_options');
const {grpcSslCipherSuites} = require('./../grpc');
const {maxReceiveMessageLength} = require('./../grpc');
const {packageTypes} = require('./../grpc');
const {protoFiles} = require('./../grpc');
const {protosDir} = require('./../grpc');
const {serviceTypes} = require('./../grpc');

const {GRPC_SSL_CIPHER_SUITES} = process.env;
const {keys} = Object;
const rpcParams = {'grpc.max_receive_message_length': maxReceiveMessageLength};

/** Initiate an gRPC API Methods Object for authenticated methods

  Both the cert and macaroon expect the entire serialized lnd generated file

  {
    [cert]: <Base64 or Hex Serialized LND TLS Cert>
    macaroon: <Base64 or Hex Serialized Macaroon String>
    [socket]: <Host:Port Network Address String>
  }

  @throws
  <Error>

  @returns
  {
    lnd: {
      autopilot: <Autopilot gRPC Methods Object>
      chain: <ChainNotifier gRPC Methods Object>
      default: <Default gRPC Methods Object>
      invoices: <Invoices gRPC Methods Object>
      router: <Router gRPC Methods Object>
      signer: <Signer gRPC Methods Object>
      wallet: <WalletKit gRPC Methods Object>
    }
  }
*/
module.exports = ({cert, macaroon, socket}) => {
  const {credentials} = grpcCredentials({cert, macaroon});
  const lndSocket = socket || defaultSocket;

  if (!!cert && GRPC_SSL_CIPHER_SUITES !== grpcSslCipherSuites) {
    process.env.GRPC_SSL_CIPHER_SUITES = grpcSslCipherSuites;
  }

  // Assemble different services from their proto files
  return {
    lnd: keys(serviceTypes).reduce((services, type) => {
      const service = serviceTypes[type];

      const protoPath = join(__dirname, protosDir, protoFiles[service]);

      const rpc = grpc.loadPackageDefinition(loadSync(protoPath, grpcOptions));

      const rpcType = packageTypes[service];

      const api = new rpc[rpcType][service](lndSocket, credentials, rpcParams);

      services[type] = api;

      return services;
    },
    {}),
  };
};
