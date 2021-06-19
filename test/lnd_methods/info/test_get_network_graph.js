const {test} = require('@alexbosworth/tap');

const {getNetworkGraph} = require('./../../../');

const makeLnd = ({edges, nodes}) => {
  return {
    default: {
      describeGraph: ({}, cbk) => {
        return cbk(null, {
          edges: edges || [{
            capacity: 1e6,
            chan_point: `${Buffer.alloc(32).toString('hex')}:0`,
            channel_id: 1,
            node1_policy: {
              disabled: false,
              fee_base_msat: '1000',
              fee_rate_milli_msat: '1',
              last_update: 1,
              max_htlc_msat: '1000',
              min_htlc: '1000',
              time_lock_delta: 1,
            },
            node1_pub: Buffer.alloc(33, 1).toString('hex'),
            node2_policy: {
              disabled: true,
              fee_base_msat: '2',
              fee_rate_milli_msat: '2',
              last_update: 2,
              max_htlc_msat: '2',
              min_htlc: '2',
              time_lock_delta: 2,
            },
            node2_pub: Buffer.alloc(33, 2).toString('hex'),
          }],
          nodes: nodes || [{
            addresses: [{addr: 'host:port', network: 'tcp'}],
            alias: 'alias',
            color: '#000000',
            features: {
              '1': {
                is_known: true,
                is_required: false,
                name: 'feature',
              },
            },
            last_update: 1,
            pub_key: Buffer.alloc(33, 1).toString('hex'),
          }],
        });
      },
    },
  };
};

const tests = [
  {
    args: {lnd: undefined},
    description: 'LND is required to get network graph',
    error: [400, 'ExpectedLndForGetNetworkGraphRequest'],
  },
  {
    args: {lnd: makeLnd({edges: 'edges'})},
    description: 'An array of edges are expected in network graph response',
    error: [503, 'ExpectedNetworkGraphEdges'],
  },
  {
    args: {lnd: makeLnd({nodes: 'nodes'})},
    description: 'An array of nodes are expected in network graph response',
    error: [503, 'ExpectedNetworkGraphNodes'],
  },
  {
    args: {lnd: {default: {describeGraph: ({}, cbk) => cbk('err')}}},
    description: 'Errors in describe graph are passed back',
    error: [503, 'GetNetworkGraphError', {err: 'err'}],
  },
  {
    args: {lnd: {default: {describeGraph: ({}, cbk) => cbk()}}},
    description: 'A response is expected in network graph response',
    error: [503, 'ExpectedNetworkGraph'],
  },
  {
    args: {
      lnd: {
        default: {
          describeGraph: ({}, cbk) => cbk(null, {edges: [{}], nodes: []}),
        },
      },
    },
    description: 'Errors in edges are passed back',
    error: [503, 'UnexpectedErrorParsingChannelsInGraph'],
  },
  {
    args: {
      lnd: {
        default: {
          describeGraph: ({}, cbk) => cbk(null, {
            edges: [],
            nodes: [{last_update: 1}],
          }),
        },
      },
    },
    description: 'Errors in nodes are passed back',
    error: [503, 'UnexpectedErrorParsingNodesInGraph'],
  },
  {
    args: {lnd: makeLnd({})},
    description: 'Network graph is returned',
    expected: {
      channels: [{
        id: '0x0x1',
        capacity: 1000000,
        policies: [
          {
            base_fee_mtokens: '1000',
            cltv_delta: 1,
            fee_rate: 1,
            is_disabled: false,
            max_htlc_mtokens: '1000',
            min_htlc_mtokens: '1000',
            public_key: '010101010101010101010101010101010101010101010101010101010101010101',
            updated_at: '1970-01-01T00:00:01.000Z',
          },
          {
            base_fee_mtokens: '2',
            cltv_delta: 2,
            fee_rate: 2,
            is_disabled: true,
            max_htlc_mtokens: '2',
            min_htlc_mtokens: '2',
            public_key: '020202020202020202020202020202020202020202020202020202020202020202',
            updated_at: '1970-01-01T00:00:02.000Z',
          },
        ],
        transaction_id: '0000000000000000000000000000000000000000000000000000000000000000',
        transaction_vout: 0,
        updated_at: '1970-01-01T00:00:02.000Z',
      }],
      nodes: [{
        alias: 'alias',
        color: '#000000',
        features: [{
          bit: 1,
          is_known: true,
          is_required: false,
          type: 'data_loss_protection'
        }],
        public_key: '010101010101010101010101010101010101010101010101010101010101010101',
        sockets: ['host:port'],
        updated_at: '1970-01-01T00:00:01.000Z',
      }],
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, rejects, strictSame}) => {
    if (!!error) {
      await rejects(() => getNetworkGraph(args), error, 'Got error');
    } else {
      strictSame(await getNetworkGraph(args), expected, 'Got expected res');
    }

    return end();
  });
});
