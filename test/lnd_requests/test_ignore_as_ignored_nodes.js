const {deepStrictEqual} = require('node:assert').strict;
const {strictEqual} = require('node:assert').strict;
const test = require('node:test');
const {throws} = require('node:assert').strict;

const {ignoreAsIgnoredNodes} = require('./../../lnd_requests');

const tests = [
  {
    args: {
      ignore: [
        {from_public_key: '00'},
        {channel: '1x2x3', from_public_key: '01'},
      ],
    },
    description: 'From ignore node is returned',
    expected: {ignore: '00'},
  },
  {
    args: {
      ignore: [
        {channel: '1x2x3', to_public_key: '01'},
        {from_public_key: '00'},
      ],
    },
    description: 'To ignored node is returned',
    expected: {ignore: '00'},
  },
  {
    args: {},
    description: 'No ignore means empty result',
    expected: {},
  },
  {
    args: {ignore: 'foo'},
    description: 'Ignore must be array',
    error: 'ExpectedArrayOfIgnoresForIgnoredNodes',
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, (t, end) => {
    if (!!error) {
      throws(() => ignoreAsIgnoredNodes(args), new Error(error), 'Got error');
    } else if (!!expected.ignore) {
      const {ignored} = ignoreAsIgnoredNodes(args);

      const [ignore] = ignored;

      deepStrictEqual(ignore.toString('hex'), expected.ignore, 'Ignore map');
    } else {
      strictEqual(ignoreAsIgnoredNodes(args).ignored, undefined, 'No ignored');
    }

    return end();
  });
});
