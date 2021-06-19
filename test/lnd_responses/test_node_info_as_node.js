const {test} = require('@alexbosworth/tap');

const {nodeInfoAsNode} = require('./../../lnd_responses');

const makeNodeDetails = ({overrides}) => {
  const details = {
    addresses: [{addr: 'addr', network: 'network'}],
    alias: 'alias',
    color: '#000000',
    features: {
      '1': {
        is_known: true,
        is_required: false,
        name: 'name',
      },
    },
    last_update: 1,
    pub_key: 'aa',
  };

  Object.keys(overrides || {}).forEach(key => details[key] = overrides[key]);

  return details;
};

const makeInfo = overrides => {
  const info = {
    channels: [{
      capacity: '1',
      chan_point: '00:0',
      channel_id: '1',
      node1_policy: {
        disabled: true,
        fee_base_msat: '1',
        fee_rate_milli_msat: '1',
        last_update: 1,
        max_htlc_msat: '1',
        min_htlc: '1',
        time_lock_delta: 1,
      },
      node1_pub: 'aa',
      node2_policy: {
        disabled: false,
        fee_base_msat: '2',
        fee_rate_milli_msat: '2',
        last_update: 2,
        max_htlc_msat: '2',
        min_htlc: '2',
        time_lock_delta: 2,
      },
      node2_pub: 'bb',
    }],
    node: makeNodeDetails({overrides}),
    num_channels: 1,
    total_capacity: 1,
  };

  Object.keys(overrides).forEach(k => info[k] = overrides[k]);

  return info;
};

const makeExpected = overrides => {
  const expected = {
    alias: 'alias',
    capacity: 1,
    channel_count: 1,
    channels: [{
      id: '0x0x1',
      capacity: 1,
      policies: [
        {
          base_fee_mtokens: '1',
          cltv_delta: 1,
          fee_rate: 1,
          is_disabled: true,
          max_htlc_mtokens: '1',
          min_htlc_mtokens: '1',
          public_key: 'aa',
          updated_at: '1970-01-01T00:00:01.000Z',
        },
        {
          base_fee_mtokens: '2',
          cltv_delta: 2,
          fee_rate: 2,
          is_disabled: false,
          max_htlc_mtokens: '2',
          min_htlc_mtokens: '2',
          public_key: 'bb',
          updated_at: '1970-01-01T00:00:02.000Z',
        },
      ],
      transaction_id: '00',
      transaction_vout: 0,
      updated_at: '1970-01-01T00:00:02.000Z'
    }],
    color: '#000000',
    features: [{
      bit: 1,
      is_known: true,
      is_required: false,
      type: 'data_loss_protection'
    }],
    sockets: [{socket: 'addr', type: 'network'}],
    updated_at: '1970-01-01T00:00:01.000Z',
  };

  Object.keys(overrides || {}).forEach(key => expected[key] = overrides[key]);

  return expected;
};

const tests = [
  {
    description: 'Node info is expected',
    error: 'ExpectedNodeDetailsToDeriveNodeInfo',
  },
  {
    args: makeInfo({node: undefined}),
    description: 'Node is expected in response',
    error: 'ExpectedNodeDetailsInNodeInfo',
  },
  {
    args: makeInfo({addresses: undefined}),
    description: 'Node addresses are expected in response',
    error: 'ExpectedArrayOfNodeAddressForNodeDetails',
  },
  {
    args: makeInfo({addresses: [{}]}),
    description: 'Addr is expected in addresses',
    error: 'ExpectedNodeAddressInNodeDetails',
  },
  {
    args: makeInfo({addresses: [{addr: 'addr'}]}),
    description: 'Network is expected in addresses',
    error: 'ExpectedNodeNetworkInNodeDetails',
  },
  {
    args: makeInfo({alias: undefined}),
    description: 'Alias is expected in node details',
    error: 'ExpectedNodeAliasFromNodeDetails',
  },
  {
    args: makeInfo({color: undefined}),
    description: 'Color is expected in node details',
    error: 'ExpectedNodeColorInNodeDetails',
  },
  {
    args: makeInfo({color: 'color'}),
    description: 'Hex color is expected in node details',
    error: 'ExpectedNodeColorInNodeDetails',
  },
  {
    args: makeInfo({features: undefined}),
    description: 'Features are expected in node details',
    error: 'ExpectedFeaturesInNodeDetails',
  },
  {
    args: makeInfo({last_update: undefined}),
    description: 'Last update is expected in node details',
    error: 'ExpectedNodeLastUpdateTimestamp',
  },
  {
    args: makeInfo({pub_key: undefined}),
    description: 'Node public key is expected in node details',
    error: 'ExpectedNodeDetailsPublicKey',
  },
  {
    args: makeInfo({num_channels: undefined}),
    description: 'Number of channels are expected in node details',
    error: 'ExpectedNodeDetailsChannelCount',
  },
  {
    args: makeInfo({total_capacity: undefined}),
    description: 'Total capacity is expected in node details',
    error: 'ExpectedTotalCapacityForNode',
  },
  {
    args: makeInfo({}),
    description: 'Node details are mapped',
    expected: makeExpected({}),
  },
  {
    args: makeInfo({last_update: 0}),
    description: 'Node details are mapped without a last update time',
    expected: makeExpected({updated_at: undefined}),
  },
  {
    args: makeInfo({channels: undefined}),
    description: 'Node details are mapped without channels returned',
    expected: makeExpected({channels: []}),
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, ({end, strictSame, throws}) => {
    if (!!error) {
      throws(() => nodeInfoAsNode(args), new Error(error), 'Got error');
    } else {
      strictSame(nodeInfoAsNode(args), expected, 'Node info mapped to node');
    }

    return end();
  });
});
