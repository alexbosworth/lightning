const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');
const {throws} = require('node:assert').strict;

const {openChannelRequest} = require('./../../lnd_messages');

const makeArgs = overrides => {
  const args = {
    close_address: 'close_address',
    local_funding_amount: '1',
    min_htlc_msat: '1',
    node_pubkey: Buffer.alloc(33, 3),
    node_pubkey_string: Buffer.alloc(33, 3).toString('hex'),
    private: false,
    push_sat: '1',
    remote_csv_delay: 1,
    sat_per_byte: '1',
    sat_per_vbyte: '1',
    spend_unconfirmed: true,
    target_conf: 1,
  };

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const makeExpected = overrides => {
  const args = {
    base_fee_mtokens: undefined,
    chain_fee_tokens_per_vbyte: 1,
    cooperative_close_address: 'close_address',
    description: undefined,
    fee_rate: undefined,
    give_tokens: 1,
    is_max_funding: undefined,
    is_private: undefined,
    local_tokens: 1,
    min_confirmations: 0,
    min_htlc_mtokens: '1',
    partner_public_key: Buffer.alloc(33, 3).toString('hex'),
    partner_csv_delay: 1,
  };

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const tests = [
  {
    args: makeArgs({}),
    description: 'Open request is converted to open request details',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({
      close_address: undefined,
      min_htlc_msat: '0',
      node_pubkey: Buffer.alloc(0),
      private: true,
      push_sat: '0',
      remote_csv_delay: 0,
      sat_per_byte: '0',
      sat_per_vbyte: '0',
      spend_unconfirmed: false,
    }),
    description: 'Defaults are selected',
    expected: makeExpected({
      chain_fee_tokens_per_vbyte: undefined,
      cooperative_close_address: undefined,
      give_tokens: undefined,
      is_private: true,
      min_confirmations: undefined,
      min_htlc_mtokens: undefined,
      partner_csv_delay: undefined,
    }),
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, (t, end) => {
    if (!!error) {
      throws(() => openChannelRequest(args), new Error(error), 'Got error');
    } else {
      const res = openChannelRequest(args);

      deepStrictEqual(res, expected, 'Got expected result');
    }

    return end();
  });
});
