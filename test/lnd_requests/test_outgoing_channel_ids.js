const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');
const {throws} = require('node:assert').strict;

const {outgoingChannelIds} = require('./../../lnd_requests');

const tests = [
  {
    args: {outgoing_channels: 'channels'},
    description: 'Outgoing channels are expected as an array',
    error: 'ExpectedArrayOfOutgoingChannelIds',
  },
  {
    args: {outgoing_channel: 12345},
    description: 'An outgoing channel is expected in standard format',
    error: 'ExpectedStandardFormatOutgoingChannelIds',
  },
  {
    args: {outgoing_channels: [12345]},
    description: 'Outgoing channels are expected in standard format',
    error: 'ExpectedStandardFormatOutgoingChannelIds',
  },
  {
    args: {},
    description: 'No outgoing channel constraint returns no ids',
    expected: {},
  },
  {
    args: {outgoing_channels: []},
    description: 'An empty set of outgoing channels is no constraint',
    expected: {},
  },
  {
    args: {outgoing_channel: '0x0x1'},
    description: 'A single outgoing channel is converted to a number',
    expected: {ids: ['1']},
  },
  {
    args: {outgoing_channel: '0x0x1', outgoing_channels: ['0x0x2', '0x0x3']},
    description: 'Multiple outgoing channels take precedence over a single',
    expected: {ids: ['2', '3']},
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, (t, end) => {
    if (!!error) {
      throws(() => outgoingChannelIds(args), new Error(error), 'Got error');
    } else {
      deepStrictEqual(outgoingChannelIds(args), expected, 'Got expected ids');
    }

    return end();
  });
});
