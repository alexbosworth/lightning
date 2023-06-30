const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');
const {throws} = require('node:assert').strict;

const {encode} = require('cbor');

const decodeCborBody = require('./../../lnd_gateway/decode_cbor_body');

const tests = [
  {
    args: {body: Buffer.alloc(3)},
    description: 'CBOR middleware expects CBOR encoded data',
    error: [400, 'ExpectedCborRequestArgs'],
  },
  {
    args: {body: encode({arguments: 'arguments'})},
    description: 'CBOR middleware decodes cbor encoded data',
    expected: {body: {arguments: 'arguments'}},
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, (t, end) => {
    const {middleware} = decodeCborBody({});
    const req = {body: args.body};

    return middleware(req, null, err => {
      if (!!error) {
        deepStrictEqual(err, error, 'Got expected error');
      } else {
        deepStrictEqual(req.body, expected.body, 'Got expected body');
      }

      return end();
    });
  });
});
