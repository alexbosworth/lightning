const {equal} = require('node:assert').strict;
const {rejects} = require('node:assert').strict;
const test = require('node:test');

const encodeResponse = require('./../../lnd_gateway/encode_response');

const tests = [
  {
    args: {},
    description: 'Data is required to encode',
    error: [400, 'ExpectedDataToEncodeResponse'],
  },
  {
    args: {data: {}},
    description: 'Event is required to encode',
    error: [400, 'ExpectedEventToEncodeResponse'],
  },
  {
    args: {data: {}, event: 'event'},
    description: 'Encoded data and event',
    expected: {response: 'a26464617461a0656576656e74656576656e74'},
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async () => {
    if (!!error) {
      await rejects(encodeResponse(args), error, 'Got expected error');
    } else {
      const {response} = await encodeResponse(args);

      equal(response.toString('hex'), expected.response, 'Encoded response');
    }

    return;
  });
});
