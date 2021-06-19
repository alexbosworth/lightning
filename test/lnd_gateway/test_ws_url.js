const {test} = require('@alexbosworth/tap');

const wsUrl = require('./../../lnd_gateway/ws_url');

const tests = [
  {
    args: {url: 'http://url'},
    description: 'A plaintext protocol URL is converted to plaintext ws URL',
    expected: {url: 'ws://url/'},
  },
  {
    args: {url: 'https://url'},
    description: 'An encrypted URL is converted to encrypted ws URL',
    expected: {url: 'wss://url/'},
  },
  {
    args: {url: 'ftp://url'},
    description: 'An unrecognized scheme is kept the same',
    expected: {url: 'ftp://url/'},
  },
];

tests.forEach(({args, description, expected}) => {
  return test(description, ({equal, end}) => {
    const {url} = wsUrl(args);

    equal(url, expected.url, 'Got expected websocket url');

    return end();
  });
});
