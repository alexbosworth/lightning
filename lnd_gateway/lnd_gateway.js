const {join} = require('path');

const {loadPackageDefinition} = require('@grpc/grpc-js');
const {loadSync} = require('@grpc/proto-loader');

const gatewayRequest = require('./gateway_request');
const gatewaySubscribe = require('./gateway_subscribe');
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
    websocket: <Websocket Constructor Object>
  }

  @throws
  <Error>

  @returns
  {
    lnd: <LND gRPC Gateway Object>
  }
*/
module.exports = ({cert, macaroon, request, url, websocket}) => {
  if (!(request instanceof Function)) {
    throw new Error('ExpectedRequestMethodForLndGateway');
  }

  if (!url) {
    throw new Error('ExpectedUrlForLndGateway');
  }

  if (!websocket) {
    throw new Error('ExpectedWebSocketConstructorForLndGateway');
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

    const definitions = packageService.service;

    const directResponseMethods = keys(definitions)
      .filter(n => !definitions[n].requestStream)
      .filter(n => !definitions[n].responseStream)
      .map(n => definitions[n].originalName);

    const streamingResponseMethods = keys(definitions)
      .filter(n => !definitions[n].requestStream)
      .filter(n => definitions[n].responseStream)
      .map(n => definitions[n].originalName);

    const streaming = streamingResponseMethods.reduce((client, method) => {
      client[method] = (params, cbk) => {
        return gatewaySubscribe({
          url,
          websocket,
          bearer: macaroon,
          call: {method, params, server},
        });
      }

      return client;
    },
    {});

    clients[server] = directResponseMethods.reduce((client, method) => {
      client[method] = (params, cbk) => {
        return gatewayRequest({
          request,
          url,
          bearer: macaroon,
          call: {method, params, server},
        },
        cbk);
      };

      return client;
    },
    streaming);

    return clients;
  },
  {});

  return {lnd};
};
