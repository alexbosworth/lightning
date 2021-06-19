const {encode} = require('cbor');
const {test} = require('@alexbosworth/tap');

const gatewayRequest = require('./../../lnd_gateway/gateway_request');

const {keys} = Object;

const makeCall = override => {
  const call = {method: 'method', params: {}, server: 'server'};

  keys(override).forEach(attr => call[attr] = override[attr]);

  return call;
};

const makeRequest = ({body, content, err, response}) => {
  const request = ({}, cbk) => {
    const r = response === undefined ? {statusCode: 200} : response;

    return cbk(err, r, body || encode(content || {err: null, res: 'res'}));
  };

  return request;
};

const makeArgs = override => {
  const args = {call: makeCall({}), request: makeRequest({}), url: 'url'};

  keys(override).forEach(attr => args[attr] = override[attr]);

  return args;
};

const tests = [
  {
    args: makeArgs({call: undefined}),
    description: 'A call is required',
    error: [400, 'ExpectedCallToMakeGatewayRequest'],
  },
  {
    args: makeArgs({call: makeCall({params: undefined})}),
    description: 'Call params are required',
    error: [400, 'ExpectedCallArgumentsToMakeGatewayRequest'],
  },
  {
    args: makeArgs({call: makeCall({method: undefined})}),
    description: 'Call method is required',
    error: [400, 'ExpectedCallMethodToMakeGatewayRequest'],
  },
  {
    args: makeArgs({call: makeCall({server: undefined})}),
    description: 'Call server is required',
    error: [400, 'ExpectedCallServerToMakeGatewayRequest'],
  },
  {
    args: makeArgs({request: undefined}),
    description: 'A request function is required',
    error: [400, 'ExpectedRequestFunctionToMakeGatewayRequest'],
  },
  {
    args: makeArgs({url: undefined}),
    description: 'A url endpoint is required',
    error: [400, 'ExpectedUrlToMakeGatewayRequest'],
  },
  {
    args: makeArgs({call: makeCall({params: {symbol: Symbol('foo')}})}),
    description: 'An error encoding params is not expected',
    error: [400, 'FailedToEncodeCborForGatewayRequest'],
  },
  {
    args: makeArgs({
      request: makeRequest({err: {code: 'ETIMEDOUT', connect: true}}),
    }),
    description: 'A connect timeout returns an error',
    error: [503, 'FailedToConnectToLndGatewayServer'],
  },
  {
    args: makeArgs({request: makeRequest({err: {code: 'ETIMEDOUT'}})}),
    description: 'A response timeout returns an error',
    error: [503, 'LndGatewayServerFailedToRespondBeforeTimeout'],
  },
  {
    args: makeArgs({request: makeRequest({err: 'err'})}),
    description: 'An unexpected error returns the error',
    error: [503, 'UnexpectedErrorFromLndGatewayServer', {err: 'err'}],
  },
  {
    args: makeArgs({request: makeRequest({response: false})}),
    description: 'A response is expected from the request function',
    error: [503, 'UnexpectedEmptyResponseFromLndGatewayServer'],
  },
  {
    args: makeArgs({request: makeRequest({response: {statusCode: 500}})}),
    description: 'An ok status code is expected from the gateway',
    error: [503, 'UnexpectedGatewayStatus', {code: 500}],
  },
  {
    args: makeArgs({request: makeRequest({body: 'body'})}),
    description: 'A buffer is expected from the gateway',
    error: [503, 'UnexpectedNontBufferResponseFromLndGateway'],
  },
  {
    args: makeArgs({request: makeRequest({body: Buffer.alloc(3)})}),
    description: 'Cbor encoded data is expected',
    error: [503, 'UnexpectedErrDecodingGatewayResponse'],
  },
  {
    args: makeArgs({request: makeRequest({content: {}})}),
    description: 'Expected error in content',
    error: [503, 'ExpectedErrorAttributeInGatewayResponse'],
  },
  {
    args: makeArgs({request: makeRequest({content: {err: undefined}})}),
    description: 'Expected result in content',
    error: [503, 'ExpectedResponseAttributeInGatewayResponse'],
  },
  {
    args: makeArgs({}),
    description: 'A request to the gateway is made',
    expected: {res: 'res'},
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, equal, rejects}) => {
    if (!!error) {
      await rejects(gatewayRequest(args), error, 'Got expected error');
    } else {
      const res = await gatewayRequest(args);

      equal(res, expected.res, 'Got expected result');
    }

    return end();
  });
});
