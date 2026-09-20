const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');
const {throws} = require('node:assert').strict;

const rpcHopFromHop = require('./../../lnd_requests/rpc_hop_from_hop');

const tests = [
  {
    args: {},
    description: 'Forward mtokens are expected',
    error: 'ExpectedForwardMillitokensToMapRpcHopFromHop',
  },
  {
    args: {forward_mtokens: '1'},
    description: 'Fee mtokens are expected',
    error: 'ExpectedFeeMillitokensToMapRpcHopFromHop',
  },
  {
    args: {
      channel: '0x0x1',
      fee: 1,
      fee_mtokens: '1000',
      forward: '1',
      forward_mtokens: '1000',
      public_key: 'public_key',
      timeout: 1,
    },
    description: 'Hop is mapped to RPC hop',
    expected: {
      amt_to_forward: '1',
      amt_to_forward_msat: '1000',
      chan_id: '1',
      expiry: 1,
      fee: '1',
      fee_msat: '1000',
      pub_key: 'public_key',
      tlv_payload: true,
    },
  },
  {
    args: {
      channel: '0x0x1',
      fee: 1,
      fee_mtokens: '1000',
      forward: '1',
      forward_mtokens: '1000',
      messages: [{type: '12', value: '34'}],
      public_key: 'public_key',
      timeout: 1,
    },
    description: 'Hop is mapped to RPC hop',
    expected: {
      amt_to_forward: '1',
      amt_to_forward_msat: '1000',
      chan_id: '1',
      custom_records: {'12': Buffer.from('34', 'hex')},
      expiry: 1,
      fee: '1',
      fee_msat: '1000',
      pub_key: 'public_key',
      tlv_payload: true,
    },
  },
  {
    args: {
      channel: '0x0x1',
      fee: 1,
      fee_mtokens: '1000',
      forward: '1',
      forward_mtokens: '1000',
      path_key: '02',
      public_key: 'public_key',
      timeout: 1,
    },
    description: 'A blinded path key requires encrypted data',
    error: 'ExpectedEncryptedDataForBlindedPathKeyInRpcHop',
  },
  {
    args: {
      channel: '0x0x1',
      encrypted_data: '01',
      fee: 1,
      fee_mtokens: '1000',
      forward: '1',
      forward_mtokens: '1000',
      messages: [{type: '12', value: '34'}],
      public_key: 'public_key',
      timeout: 1,
    },
    description: 'A blinded path hop cannot have messages',
    error: 'ExpectedNoMessagesForBlindedPathHop',
  },
  {
    args: {
      channel: '0x0x1',
      encrypted_data: '01',
      fee: 1,
      fee_mtokens: '1000',
      forward: 0,
      forward_mtokens: '0',
      path_key: '02',
      public_key: 'public_key',
      timeout: 0,
    },
    description: 'Blinded path introduction hop is mapped to RPC hop',
    expected: {
      amt_to_forward: '0',
      amt_to_forward_msat: '0',
      blinding_point: Buffer.from('02', 'hex'),
      chan_id: '1',
      encrypted_data: Buffer.from('01', 'hex'),
      expiry: 0,
      fee: '1',
      fee_msat: '1000',
      pub_key: 'public_key',
      tlv_payload: true,
    },
  },
  {
    args: {
      channel: '0x0x0',
      encrypted_data: '01',
      fee: 0,
      fee_mtokens: '0',
      forward: 1,
      forward_mtokens: '1000',
      public_key: 'public_key',
      timeout: 1,
    },
    description: 'Blinded path hop is mapped to RPC hop',
    expected: {
      amt_to_forward: '1',
      amt_to_forward_msat: '1000',
      chan_id: '0',
      encrypted_data: Buffer.from('01', 'hex'),
      expiry: 1,
      fee: '0',
      fee_msat: '0',
      pub_key: 'public_key',
      tlv_payload: true,
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, (t, end) => {
    if (!!error) {
      throws(() => rpcHopFromHop(args), new Error(error), 'Got error');
    } else {
      deepStrictEqual(rpcHopFromHop(args), expected, 'RPC hop from a hop');
    }

    return end();
  });
});
