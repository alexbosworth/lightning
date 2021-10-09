const {test} = require('@alexbosworth/tap');

const {closeChannelRequest} = require('./../../lnd_messages');

const makeArgs = overrides => {
  const args = {
    channel_point: {
      funding_txid_bytes: Buffer.from('010203', 'hex'),
      output_index: 0,
    },
    delivery_address: 'delivery_address',
    force: true,
    sat_per_byte: '1',
    target_conf: 1,
  };

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const makeExpected = overrides => {
  const args = {
    address: 'delivery_address',
    is_force_close: true,
    target_confirmations: 1,
    tokens_per_vbyte: 1,
    transaction_id: '030201',
    transaction_vout: 0,
  };

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const tests = [
  {
    args: makeArgs({}),
    description: 'Close request is converted to close request details',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({
      delivery_address: '',
      force: false,
      sat_per_byte: '0',
      target_conf: 0,
    }),
    description: 'Defaults are selected',
    expected: makeExpected({
      address: undefined,
      is_force_close: undefined,
      target_confirmations: undefined,
      tokens_per_vbyte: undefined,
    }),
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, ({end, equal, strictSame, throws}) => {
    if (!!error) {
      throws(() => closeChannelRequest(args), new Error(error), 'Got error');
    } else {
      const res = closeChannelRequest(args);

      strictSame(res, expected, 'Got expected result');
    }

    return end();
  });
});
