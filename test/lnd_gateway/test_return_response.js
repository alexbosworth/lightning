const {test} = require('@alexbosworth/tap');

const returnResponse = require('./../../lnd_gateway/return_response');

const tests = [
  {
    args: {err: true},
    description: 'An error is returned',
    expected: {code: 500},
  },
  {
    args: {response: {err: 'err', res: 'res'}},
    description: 'A response is returned',
    expected: {
      body: Buffer.from('a263657272636572726372657363726573', 'hex'),
      type: 'application/cbor',
    },
  },
  {
    args: {response: {err: 'err', res: Symbol('foo')}},
    description: 'Encoding errors return a server error',
    expected: {code: 500},
  },
];

tests.forEach(({args, description, expected}) => {
  return test(description, ({equal, end}) => {
    let code;
    let type;

    const res = {
      send: body => {
        if (!!expected.code) {
          equal(code, expected.code, 'Got expected code');
        } else {
          equal(type, expected.type, 'Got expected body type');
          equal(body.equals(expected.body), true, 'Got expected body data');
        }

        return end();
      },
      status: n => code = n,
      type: n => type = n,
    };

    return returnResponse({res}).responder(args.err, args.response);
  });
});
