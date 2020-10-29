const grpc = require('@grpc/grpc-js');
const {loadSync} = require('@grpc/proto-loader');

const grpcOptions = require('./grpc_options');

/** Get an api for a proto file

  {
    path: <Proto File Path String>
    service: <Service Name String>
    type: <RPC Type String>
  }

  @returns
  <API Object>
*/
module.exports = ({credentials, params, path, service, socket, type}) => {
  const rpc = grpc.loadPackageDefinition(loadSync(path, grpcOptions));

  return new rpc[type][service](socket, credentials, params);
};
