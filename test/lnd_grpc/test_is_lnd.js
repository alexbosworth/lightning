const {test} = require('@alexbosworth/tap');

const {isLnd} = require('./../../lnd_grpc');

const tests = [
  {
    args: {},
    description: 'No LND passed means it is not an LND',
    expected: false,
  },
  {
    args: {lnd: {}},
    description: 'There is an LND but the type is missing',
    expected: false,
  },
  {
    args: {lnd: {}, type: 'type'},
    description: 'There is an LND but the type is missing',
    expected: false,
  },
  {
    args: {lnd: {type: {}}, type: 'type'},
    description: 'There is an LND but the method is missing',
    expected: false,
  },
  {
    args: {lnd: {type: {method: 'method'}}, method: 'method', type: 'type'},
    description: 'There is an LND but the method is missing',
    expected: true,
  },
];

tests.forEach(({args, description, expected}) => {
  return test(description, async ({end, equal}) => {
    const res = isLnd(args);

    equal(res, expected, 'LND status is as expected');

    return end();
  });
});
