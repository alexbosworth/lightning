const {deepStrictEqual} = require('node:assert').strict;
const test = require('node:test');
const {throws} = require('node:assert').strict;

const {subscribeToGraph} = require('./../../../');
const {subscriptionEvents} = require('./../macros');

const features = [{bit: 1, is_known: true, is_required: false}];
const identityKey = Buffer.alloc(33).toString('hex');
const listenerFailure = {event: 'error', data: [503, 'ListenerFailure']};
const makeLnd = overrides => {
  const node = {
    addresses: [{addr: 'addr', network: 'network'}],
    alias: 'alias',
    color: '#123456',
    features: {'1': {is_known: true, is_required: false}},
    last_update: 1,
    pub_key: Buffer.alloc(33).toString('hex'),
  };

  Object.keys(overrides).forEach(k => node[k] = overrides[k]);

  return {
    default: {
      getNodeInfo: ({}, cbk) => {
        return cbk(null, {
          node,
          channels: [],
          num_channels: 1,
          total_capacity: 1,
        });
      },
    },
  };
};
const makeUpdate = overrides => {
  const update = {channel_updates: [], closed_chans: [], node_updates: []};

  Object.keys(overrides).forEach(k => update[k] = overrides[k]);

  return update;
};
const nodeUpdate = {node_updates: [{identity_key: identityKey}]};
const transactionId = Buffer.alloc(32, 1).toString('hex');

// The graph update that the mock LND sends
const graphUpdate = {
  channel_updates: [{
    advertising_node: Buffer.alloc(33).toString('hex'),
    capacity: '1',
    chan_id: '1',
    chan_point: {funding_txid_bytes: Buffer.alloc(32, 1), output_index: 0},
    connecting_node: Buffer.alloc(33, 1).toString('hex'),
    routing_policy: {
      disabled: false,
      fee_base_msat: '1',
      fee_rate_milli_msat: '1',
      max_htlc_msat: '1',
      min_htlc: '1',
      time_lock_delta: 1,
    },
  }],
  closed_chans: [{
    capacity: '1',
    chan_id: '1',
    chan_point: {funding_txid_bytes: Buffer.alloc(32, 1), output_index: 1},
    closed_height: 1,
  }],
  node_updates: [{
    addresses: ['addr'],
    alias: 'alias',
    color: '#123456',
    features: {'1': {is_known: true, is_required: false}},
    identity_key: identityKey,
  }],
};

// Events emitted for the graph update that the mock LND sends
const graphEvents = [
  {
    event: 'channel_updated',
    data: {
      base_fee_mtokens: '1',
      capacity: 1,
      cltv_delta: 1,
      fee_rate: 1,
      id: '0x0x1',
      inbound_base_discount_mtokens: '0',
      inbound_rate_discount: 0,
      is_disabled: false,
      max_htlc_mtokens: '1',
      min_htlc_mtokens: '1',
      public_keys: [identityKey, Buffer.alloc(33, 1).toString('hex')],
      transaction_id: transactionId,
      transaction_vout: 0,
    },
  },
  {
    event: 'channel_closed',
    data: {
      capacity: 1,
      close_height: 1,
      id: '0x0x1',
      transaction_id: transactionId,
      transaction_vout: 1,
    },
  },
  {
    event: 'node_updated',
    data: {
      alias: 'alias',
      color: '#123456',
      features: [{...features[0], type: 'data_loss_protection'}],
      public_key: identityKey,
      sockets: ['addr'],
    },
  },
  {event: 'error', data: 'error'},
];

const tests = [
  {
    args: {lnd: undefined},
    description: 'LND object is required to subscribe to graph',
    error: 'ExpectedAuthenticatedLndToSubscribeToChannelGraph',
  },
  {
    args: {lnd: makeLnd({})},
    description: 'Updates are expected',
    expected: {
      cancels: ['cancel'],
      events: [{event: 'error', data: new Error('ExpectedChannelUpdates')}],
    },
    stream: [['data', makeUpdate({channel_updates: undefined})]],
  },
  {
    args: {lnd: makeLnd({})},
    description: 'Closed channels are expected',
    expected: {
      cancels: ['cancel'],
      events: [{event: 'error', data: new Error('ExpectedClosedChans')}],
    },
    stream: [['data', makeUpdate({closed_chans: undefined})]],
  },
  {
    args: {lnd: makeLnd({})},
    description: 'Node updates are expected',
    expected: {
      cancels: ['cancel'],
      events: [{event: 'error', data: new Error('ExpectedNodeUpdates')}],
    },
    stream: [['data', makeUpdate({node_updates: undefined})]],
  },
  {
    args: {lnd: makeLnd({})},
    description: 'Update errors are emitted',
    expected: {
      cancels: ['cancel'],
      events: [
        {event: 'error', data: new Error('ExpectedChannelUpdateDetails')},
      ],
    },
    stream: [['data', makeUpdate({channel_updates: [null]})]],
  },
  {
    args: {lnd: makeLnd({})},
    description: 'Closed errors are emitted',
    expected: {
      cancels: ['cancel'],
      events: [{
        event: 'error',
        data: new Error('ExpectedChannelClosedUpdateDetails'),
      }],
    },
    stream: [['data', makeUpdate({closed_chans: [null]})]],
  },
  {
    args: {lnd: makeLnd({})},
    description: 'Node errors are emitted',
    expected: {
      cancels: ['cancel'],
      events: [{
        event: 'error',
        data: new Error('ExpectedDetailsInNodeUpdateAnnouncement'),
      }],
    },
    stream: [['data', makeUpdate({node_updates: [null]})]],
  },
  {
    args: {lnd: makeLnd({})},
    description: 'Node public key is expected',
    expected: {
      cancels: ['cancel'],
      events: [{
        event: 'error',
        data: new Error('ExpectedPubKeyInNodeUpdateAnnouncement'),
      }],
    },
    stream: [['data', makeUpdate({node_updates: [{}]})]],
  },
  {
    args: {lnd: {default: {}}},
    description: 'Get node errors are passed back',
    expected: {
      cancels: ['cancel'],
      events: [
        {event: 'error', data: [400, 'ExpectedLndApiObjectToGetNodeInfo']},
      ],
    },
    stream: [['data', makeUpdate(nodeUpdate)]],
  },
  {
    args: {lnd: makeLnd({last_update: 0})},
    description: 'Get node does not require updated at',
    expected: {
      events: [{
        event: 'node_updated',
        data: {
          alias: 'alias',
          color: '#123456',
          features: [{...features[0], type: 'data_loss_protection'}],
          public_key: identityKey,
          sockets: ['addr'],
        },
      }],
    },
    stream: [['data', makeUpdate(nodeUpdate)]],
  },
  {
    args: {lnd: makeLnd({})},
    description: 'Graph events are received',
    expected: {cancels: ['cancel'], events: graphEvents},
  },
  {
    args: {lnd: makeLnd({})},
    description: 'Stream errors are ignored without an error listener',
    expected: {cancels: ['cancel'], events: graphEvents.slice(0, -1)},
    listening: ['channel_closed', 'channel_updated', 'node_updated'],
  },
  {
    args: {lnd: makeLnd({})},
    description: 'A throwing listener is reported without ending the stream',
    expected: {
      cancels: ['cancel'],
      events: [graphEvents[0], listenerFailure, ...graphEvents.slice(1)],
    },
    throwing: ['channel_updated'],
  },
  {
    args: {lnd: makeLnd({})},
    description: 'Removing the last graph listener cancels the stream',
    expected: {cancels: ['cancel'], events: []},
    removing: ['error', 'channel_closed', 'channel_updated', 'node_updated'],
    stream: [],
  },
];

tests.forEach(({args, description, error, expected, ...scenario}) => {
  return test(description, async () => {
    if (!!error) {
      throws(() => subscribeToGraph(args), new Error(error), 'Got error');

      return;
    }

    const got = await subscriptionEvents({
      ...scenario,
      events: ['channel_closed', 'channel_updated', 'error', 'node_updated'],
      stream: scenario.stream || [['data', graphUpdate], ['error', 'error']],
      subscribe: stream => {
        args.lnd.default.subscribeChannelGraph = ({}) => stream;

        return subscribeToGraph(args);
      },
    });

    // The node updated time is the time of receipt, so it is not compared
    got.events.forEach(({data}) => delete data.updated_at);

    deepStrictEqual(got, {cancels: [], ...expected}, 'Got expected events');

    return;
  });
});
