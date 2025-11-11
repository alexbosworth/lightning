const {join} = require('path');

const apiForProto = require('./../lnd_grpc/api_for_proto');
const grpcCredentials = require('./../lnd_grpc/grpc_credentials');
const {grpcSslCipherSuites} = require('./../grpc');
const {protosDir} = require('./../grpc');

const {GRPC_SSL_CIPHER_SUITES} = process.env;
const {keys} = Object;
const pathForProto = proto => join(__dirname, '..', protosDir, proto);

const serviceTypes = {
  taprootassets: 'TaprootAssets',
};

const protoFiles = {
  TaprootAssets: 'taprootassets.proto',
};

const packageTypesForTapd = {
  TaprootAssets: 'taprpc',
};

/** Initiate a gRPC API Methods Object for authenticated tapd methods

  Both the cert and macaroon expect the entire serialized tapd generated file

  {
    [cert]: <Base64 or Hex Serialized Tapd TLS Cert>
    [macaroon]: <Base64 or Hex Serialized Macaroon String>
    [path]: <Path to Proto Files Directory String>
    [socket]: <Host:Port Network Address String>
  }

  @throws
  <Error>

  @returns
  {
    tapd: {
      taprootassets: <TaprootAssets API Methods Object>
    }
  }
*/
module.exports = ({cert, macaroon, path, socket}) => {
  const {credentials} = grpcCredentials({cert, macaroon});
  const tapdSocket = socket || '127.0.0.1:10029'; // Default tapd port

  if (!!cert && GRPC_SSL_CIPHER_SUITES !== grpcSslCipherSuites) {
    process.env.GRPC_SSL_CIPHER_SUITES = grpcSslCipherSuites;
  }

  const params = {
    'grpc.max_receive_message_length': -1,
    'grpc.max_send_message_length': -1,
  };

  // Assemble different services from their proto files
  return {
    tapd: keys(serviceTypes).reduce((services, type) => {
      const service = serviceTypes[type];

      const file = protoFiles[service];

      services[type] = apiForProto({
        credentials,
        params,
        service,
        path: !!path ? join(path, file) : pathForProto(file),
        socket: tapdSocket,
        type: packageTypesForTapd[service],
      });

      return services;
    },
    {}),
  };
};
