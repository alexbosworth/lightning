const {test} = require('tap');

const {destinationCustomRecords} = require('./../../lnd_requests');

const tests = [
  {
    args: {},
    description: 'No messages or records results in empty TLV',
    expected: {tlv: {}},
  },
  {
    args: {messages: [{type: '1', value: '00'}]},
    description: 'Plain messages are returned',
    expected: {tlv: {'1': Buffer.from('00', 'hex')}},
  },
];

tests.forEach(({args, description, expected}) => {
  return test(description, ({deepIs, end}) => {
    const {tlv} = destinationCustomRecords(args);

    deepIs(tlv, expected.tlv, 'Got expected output');

    return end();
  });
});
