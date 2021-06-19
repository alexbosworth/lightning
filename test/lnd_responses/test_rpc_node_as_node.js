const {test} = require('@alexbosworth/tap');

const {rpcNodeAsNode} = require('./../../lnd_responses');

const makeInfo = overrides => {
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
    pub_key: Buffer.alloc(33, 1).toString('hex'),
  };

  Object.keys(overrides || {}).forEach(key => details[key] = overrides[key]);

  return details;
};

const makeExpected = overrides => {
  const expected = {
    alias: 'alias',
    color: '#000000',
    features: [{
      bit: 1,
      is_known: true,
      is_required: false,
      type: 'data_loss_protection'
    }],
    public_key: Buffer.alloc(33, 1).toString('hex'),
    sockets: [{socket: 'addr', type: 'network'}],
    updated_at: '1970-01-01T00:00:01.000Z',
  };

  Object.keys(overrides || {}).forEach(key => expected[key] = overrides[key]);

  return expected;
};

const tests = [
  {
    description: 'Node info is expected',
    error: 'ExpectedNodeDetailsToMapRpcNodeToNode',
  },
  {
    args: makeInfo({addresses: undefined}),
    description: 'Node addresses are expected in response',
    error: 'ExpectedArrayOfNodeAddressForNodeDetails',
  },
  {
    args: makeInfo({addresses: [undefined]}),
    description: 'Address details are expected in addresses',
    error: 'ExpectedArrayOfNetworkAddressesForRpcNode',
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
    args: makeInfo({}),
    description: 'Node details are mapped',
    expected: makeExpected({}),
  },
  {
    args: makeInfo({last_update: 0}),
    description: 'Node details are mapped without a last update time',
    expected: makeExpected({updated_at: undefined}),
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, ({end, strictSame, throws}) => {
    if (!!error) {
      throws(() => rpcNodeAsNode(args), new Error(error), 'Got error');
    } else {
      strictSame(rpcNodeAsNode(args), expected, 'Node info mapped to node');
    }

    return end();
  });
});
