const {join} = require('path');

const {loadPackageDefinition} = require('grpc');
const {loadSync} = require('@grpc/proto-loader');

const gatewayRequest = require('./gateway_request');
const {packageTypes} = require('./../grpc');
const {protoFiles} = require('./../grpc');
const {protosDir} = require('./../grpc');
const {serviceTypes} = require('./../grpc');
const {unauthenticatedPackageTypes} = require('./../grpc');
const {unauthenticatedServiceTypes} = require('./../grpc');

const {keys} = Object;

/** Interface to an LND gateway server.

  {
    [cert]: <Base64 or Hex Serialized Gateway TLS Cert String>
    [macaroon]: <Use Base 64 Encoded Macaroon String>
    request: <Request Function>
    url: <LND Gateway URL String>
  }

  @throws
  <Error>

  @returns
  {
    lnd: <LND gRPC Gateway Object>
  }
*/
module.exports = ({cert, macaroon, request, url}) => {
  if (!(request instanceof Function)) {
    throw new Error('ExpectedRequestMethodForLndGateway');
  }

  if (!url) {
    throw new Error('ExpectedUrlForLndGateway');
  }

  const {services, types} = (() => {
    const services = !macaroon ? unauthenticatedPackageTypes : packageTypes;
    const types = !macaroon ? unauthenticatedServiceTypes : serviceTypes;

    return {types, services: keys(services)};
  })();

  const servers = keys(types).reduce((sum, n) => {
    sum[types[n]] = n;

    return sum;
  },
  {});

  const lnd = services.reduce((clients, service) => {
    const protoFile = protoFiles[service];
    const server = servers[service];

    const protoPath = join(__dirname, protosDir, protoFile);

    const rpc = loadPackageDefinition(loadSync(protoPath));

    const packageService = rpc[packageTypes[service]][service];

    const definitions = packageService.prototype['$method_definitions'];

    const methods = keys(definitions).map(n => definitions[n].originalName);

    clients[server] = methods.reduce((client, method) => {
      client[method] = (arguments, cbk) => {
        return gatewayRequest({
          request,
          url,
          bearer: macaroon,
          call: {arguments, method, server},
        },
        cbk);
      };

      return client;
    },
    {});

    return clients;
  },
  {});

  return {lnd};
};
