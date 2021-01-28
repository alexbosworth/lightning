const grpc = require('@grpc/grpc-js');

const decodeSerialized = require('./decode_serialized');
const grpcSsl = require('./grpc_ssl');

const {combineChannelCredentials} = grpc.credentials;
const {createFromMetadataGenerator} = grpc.credentials;
const {Metadata} = grpc;

const generate = macaroon => {
  const metadata = new Metadata();

  try { metadata.add('macaroon', macaroon.toString('hex')); } catch (err) {}

  return metadata;
};

/** Credentials for gRPC

  {
    [cert]: <Base64 or Hex Serialized LND TLS Cert>
    [macaroon]: <Base64 or Hex Serialized Macaroon String>
  }

  @throws
  <Error>

  @returns
  {
    credentials: <gRPC Credentials Object>
  }
*/
module.exports = ({cert, macaroon}) => {
  if (!macaroon) {
    return {credentials: grpcSsl({cert}).ssl};
  }

  const mac = decodeSerialized({serialized: macaroon}).decoded;

  if (!mac) {
    generate(mac);

    throw new Error('ExpectedBase64OrHexEncodedMacaroonToCreateCredentials');
  }

  const creds = createFromMetadataGenerator((_, c) => c(null, generate(mac)));
  const {ssl} = grpcSsl({cert});

  return {credentials: combineChannelCredentials(ssl, creds)};
};
