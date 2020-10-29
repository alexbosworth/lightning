const grpc = require('@grpc/grpc-js');
// const grpc = require('grpc');

/** Make metadata

  {
    macaroon: <Macaroon Buffer Object>
  }

  @returns
  {
    metadata: <Metadata Object>
  }
*/
module.exports = ({macaroon}) => {
  const metadata = new grpc.Metadata();

  metadata.add('macaroon', macaroon);

  return {metadata};
};
