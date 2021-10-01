const methods = require('./methods');

const {serviceTypes} = require('./../../grpc');

const flatten = arr => arr.flat(Infinity);
const type = n => [methods[n]].concat((methods[n].depends_on || []).map(type));
const uriForMethod = (service, method) => `/lnrpc.${service}/${method}`;

/** Given a method, derive URI macaroon permission strings required

  {
    method: <Method Name String>
  }

  @throws
  <Error>

  @returns
  {
    uris: [<Permission URI String>]
  }
*/
module.exports = ({method}) => {
  if (!method) {
    throw new Error('ExpectedMethodNameToDeriveMacaroonUris');
  }

  if (!methods[method]) {
    throw new Error('ExpectedKnownMethodNameToDeriveMacaroonUris');
  }

  const requiredMethods = flatten(type(method)).filter(({type}) => type);

  const uris = requiredMethods.map(({method, methods, type}) => {
    const service = serviceTypes[type];

    if (!service) {
      throw new Error('ExpectedKnownMethodServiceToDeriveMacaroonUris');
    }

    return (methods || [method]).map(methodName => {
      return uriForMethod(service, methodName);
    });
  });

  uris.sort();

  return {uris: flatten(uris)};
};
