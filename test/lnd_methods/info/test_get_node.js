const {test} = require('@alexbosworth/tap');

const {getNode} = require('./../../../');

const makeLnd = ({err, getVersionErr, res}) => {
  const response = {
    channels: [{
      capacity: '1',
      chan_point: `${Buffer.alloc(32).toString('hex')}:0`,
      channel_id: '000000000',
      node1_policy: {
        disabled: true,
        fee_base_msat: '1',
        fee_rate_milli_msat: '1',
        last_update: 1,
        max_htlc_msat: '1',
        min_htlc: '1',
        time_lock_delta: 1,
      },
      node1_pub: Buffer.alloc(33).toString('hex'),
      node2_policy: {
        disabled: false,
        fee_base_msat: '2',
        fee_rate_milli_msat: '2',
        last_update: 1,
        max_htlc_msat: '2',
        min_htlc: '2',
        time_lock_delta: 2,
      },
      node2_pub: Buffer.alloc(33, 1).toString('hex'),
    }],
    node: {
      addresses: [{addr: 'addr', network: 'network'}],
      alias: 'alias',
      color: '#123456',
      features: {'1': {is_known: true, is_required: false}},
      last_update: 1,
      pub_key: Buffer.alloc(33).toString('hex'),
    },
    num_channels: 1,
    total_capacity: 1,
  };

  return {
    default: {
      getChanInfo: ({}, cbk) => {
        return cbk(null, {
          capacity: '1',
          chan_point: `${Buffer.alloc(32).toString('hex')}:0`,
          channel_id: '000000000',
          node1_policy: {
            disabled: true,
            fee_base_msat: '1',
            fee_rate_milli_msat: '1',
            last_update: 1,
            max_htlc_msat: '1',
            min_htlc: '1',
            time_lock_delta: 1,
          },
          node1_pub: Buffer.alloc(33).toString('hex'),
          node2_policy: {
            disabled: false,
            fee_base_msat: '2',
            fee_rate_milli_msat: '2',
            last_update: 1,
            max_htlc_msat: '2',
            min_htlc: '2',
            time_lock_delta: 2,
          },
          node2_pub: Buffer.alloc(33, 1).toString('hex'),
        });
      },
      getNodeInfo: ({}, cbk) => cbk(err, res || response),
    },
    version: {
      getVersion: ({}, cbk) => cbk(getVersionErr, {
        app_minor: 1,
        app_patch: 1,
        build_tags: ['autopilotrpc'],
        commit_hash: Buffer.alloc(20).toString('hex'),
      }),
    },
  };
};

const makeExpected = ({}) => {
  return {
    alias: 'alias',
    capacity: 1,
    channel_count: 1,
    channels: [{
      id: '0x0x0',
      capacity: 1,
      policies: [
        {
          base_fee_mtokens: '1',
          cltv_delta: 1,
          fee_rate: 1,
          is_disabled: true,
          max_htlc_mtokens: '1',
          min_htlc_mtokens: '1',
          public_key: Buffer.alloc(33).toString('hex'),
          updated_at: '1970-01-01T00:00:01.000Z',
        },
        {
          base_fee_mtokens: '2',
          cltv_delta: 2,
          fee_rate: 2,
          is_disabled: false,
          max_htlc_mtokens: '2',
          min_htlc_mtokens: '2',
          public_key: Buffer.alloc(33, 1).toString('hex'),
          updated_at: '1970-01-01T00:00:01.000Z',
        },
      ],
      transaction_id: Buffer.alloc(32).toString('hex'),
      transaction_vout: 0,
      updated_at: '1970-01-01T00:00:01.000Z',
    }],
    color: '#123456',
    features: [{
      bit: 1,
      is_known: true,
      is_required: false,
      type: 'data_loss_protection',
    }],
    sockets: [{socket: 'addr', type: 'network'}],
    updated_at: '1970-01-01T00:00:01.000Z',
  };
};

const tests = [
  {
    args: {},
    description: 'LND is required to get node information',
    error: [400, 'ExpectedLndApiObjectToGetNodeInfo'],
  },
  {
    args: {lnd: makeLnd({})},
    description: 'A node public key is required to get node information',
    error: [400, 'ExpectedPublicKeyForNodeInfo'],
  },
  {
    args: {
      lnd: makeLnd({err: {details: 'unable to find node'}}),
      public_key: 'public_key',
    },
    description: 'No node returns missing node error',
    error: [404, 'NodeIsUnknown'],
  },
  {
    args: {lnd: makeLnd({err: 'err'}), public_key: 'public_key'},
    description: 'Error is returned',
    error: [503, 'FailedToRetrieveNodeDetails', {err: 'err'}],
  },
  {
    args: {lnd: makeLnd({res: {}}), public_key: 'public_key'},
    description: 'A node result is expected',
    error: [503, 'ExpectedNodeDetailsInNodeInfo'],
  },
  {
    args: {lnd: makeLnd({}), public_key: 'public_key'},
    description: 'Node details are returned from get node',
    expected: makeExpected({}),
  },
  {
    args: {lnd: makeLnd({getVersionErr: 'err'}), public_key: 'public_key'},
    description: 'Node details are returned from get node',
    expected: makeExpected({}),
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, rejects, strictSame}) => {
    if (!!error) {
      await rejects(() => getNode(args), error, 'Got expected error');
    } else {
      strictSame(await getNode(args), expected, 'Got expected node details');
    }

    return end();
  });
});
