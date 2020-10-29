const grpc = require('@grpc/grpc-js');

const decodeSerialized = require('./decode_serialized');

const {createSsl} = grpc.credentials;

/** Get SSL for gRPC

  {
    [cert]: <Cert Hex or Base64 String>
  }

  @returns
  {
    ssl: <SSL gRPC Object>
  }
*/
module.exports = ({cert}) => {
  return {ssl: createSsl(decodeSerialized({serialized: cert}).decoded)};
};
