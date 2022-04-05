const {test} = require('@alexbosworth/tap');

const rpcHopFromHop = require('./../../lnd_requests/rpc_hop_from_hop');

const tests = [
  {
    args: {},
    description: 'Channel capacity is expected',
    error: 'ExpectedNumericChannelCapacityToMapRpcHopFromHop',
  },
  {
    args: {channel_capacity: 1},
    description: 'Forward mtokens are expected',
    error: 'ExpectedForwardMillitokensToMapRpcHopFromHop',
  },
  {
    args: {channel_capacity: 1, forward_mtokens: '1'},
    description: 'Fee mtokens are expected',
    error: 'ExpectedFeeMillitokensToMapRpcHopFromHop',
  },
  {
    args: {
      channel: '0x0x1',
      channel_capacity: 1,
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
      chan_capacity: '1',
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
      channel_capacity: 1,
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
      chan_capacity: '1',
      custom_records: {'12': Buffer.from('34', 'hex')},
      expiry: 1,
      fee: '1',
      fee_msat: '1000',
      pub_key: 'public_key',
      tlv_payload: true,
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, ({end, strictSame, throws}) => {
    if (!!error) {
      throws(() => rpcHopFromHop(args), new Error(error), 'Got error');
    } else {
      strictSame(rpcHopFromHop(args), expected, 'RPC hop derived from a hop');
    }

    return end();
  });
});
