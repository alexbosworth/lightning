const {test} = require('@alexbosworth/tap');
const websocket = require('ws');

const {lndGateway} = require('./../../');

const tests = [
  {
    args: {},
    description: 'A request function is required',
    error: 'ExpectedRequestMethodForLndGateway',
  },
  {
    args: {request: () => {}},
    description: 'A url endpoint is required',
    error: 'ExpectedUrlForLndGateway',
  },
  {
    args: {request: () => {}, url: 'url'},
    description: 'A websocket constructor is required',
    error: 'ExpectedWebSocketConstructorForLndGateway',
  },
  {
    args: {websocket, request: (args, cbk) => cbk(args), url: 'url'},
    description: 'A LND gateway is returned',
    expected: {
      err: [
        503,
        'UnexpectedErrorFromLndGatewayServer',
        {
          err: {
            auth: {bearer: undefined},
            body: Buffer.from('a0', 'hex'),
            encoding: null,
            forever: true,
            headers: {'content-type': 'application/cbor'},
            method: 'POST',
            timeout: 25000,
            uri: 'url/unlocker/genSeed',
          },
        },
      ],
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, ({end, strictSame, throws}) => {
    if (!!error) {
      throws(() => lndGateway(args), new Error(error), 'Got expected error');

      return end();
    } else {
      const {lnd} = lndGateway(args);

      lnd.unlocker.genSeed({}, (err, res) => {
        const [code, message, details] = err;

        strictSame(err, expected.err, 'Got expected result');

        return end();
      });
    }
  });
});
