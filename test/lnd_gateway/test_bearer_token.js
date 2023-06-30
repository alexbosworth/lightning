const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');
const {throws} = require('node:assert').strict;

const bearerToken = require('./../../lnd_gateway/bearer_token');

const tests = [
  {
    args: {},
    description: 'Bearer token middleware skips when there is no auth',
    expected: {locals: {}},
  },
  {
    args: {header: 'Bearer macaroon'},
    description: 'Bearer token middleware returns auth token',
    expected: {locals: {auth: {bearer: 'macaroon'}}},
  },
];

tests.forEach(({args, description, expected}) => {
  return test(description, (t, end) => {
    const {middleware} = bearerToken({});
    const res = {locals: {}};

    return middleware({get: key => args.header}, res, () => {
      deepStrictEqual(res.locals, expected.locals, 'Got expected locals');

      return end();
    });
  });
});
