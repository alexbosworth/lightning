const {test} = require('@alexbosworth/tap');

const method = require('./../../../lnd_methods/offchain/route_failure_keys');

const tests = [
  {
    args: {},
    description: 'When there is no failure, no keys are returned',
    expected: {},
  },
  {
    args: {failure: {}},
    description: 'When there is no channel update, no keys are returned',
    expected: {},
  },
  {
    args: {failure: {channel_update: {}}},
    description: 'When there is no chan id, no keys are returned',
    expected: {},
  },
  {
    args: {
      failure: {channel_update: {chan_id: '1'}},
      route: {hops: [{channel: '0x0x1'}]},
    },
    description: 'When the hop is the first hop, no keys are returned',
    expected: {},
  },
  {
    args: {
      failure: {channel_update: {chan_id: '1'}},
      route: {hops: []},
    },
    description: 'When the hop is not found, no keys are returned',
    expected: {},
  },
  {
    args: {
      failure: {channel_update: {chan_id: '1'}},
      route: {hops: [{public_key: 'a'}, {channel: '0x0x1', public_key: 'b'}]},
    },
    description: 'When the hop is found, keys are returned',
    expected: {keys: ['b', 'a']},
  },
];

tests.forEach(({args, description, expected}) => {
  return test(description, ({end, strictSame}) => {
    const {keys} = method(args);

    strictSame(keys, expected.keys, 'Got expected route failure keys');

    return end();
  });
});
