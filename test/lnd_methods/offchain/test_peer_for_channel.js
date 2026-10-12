const {deepStrictEqual} = require('node:assert').strict;
const {rejects} = require('node:assert').strict;
const test = require('node:test');

const {chanNumber} = require('bolt07');

const method = require('./../../../lnd_methods/offchain/peer_for_channel');

const alias = '16000000x0x1';
const channel = '1x2x3';
const id = Buffer.alloc(33, 2).toString('hex');
const other = Buffer.alloc(33, 4).toString('hex');
const outpoint = `${Buffer.alloc(32).toString('hex')}:0`;
const peer = Buffer.alloc(33, 3).toString('hex');

// A channel of the node as LND lists it
const makeChannel = ({aliases, number, partner}) => ({
  active: true,
  alias_scids: aliases || [],
  capacity: '1',
  chan_id: number,
  channel_point: outpoint,
  commit_fee: '1',
  commit_weight: '1',
  commitment_type: 'ANCHORS',
  fee_per_kw: '1',
  local_balance: '1',
  local_chan_reserve_sat: '1',
  local_constraints: {},
  num_updates: '1',
  pending_htlcs: [],
  private: true,
  remote_balance: '1',
  remote_chan_reserve_sat: '1',
  remote_constraints: {},
  remote_pubkey: partner,
  thaw_height: 0,
  total_satoshis_received: '1',
  total_satoshis_sent: '1',
  unsettled_balance: '1',
});

// A channel as LND has it in the graph, without policies
const makeEdge = ([node1, node2]) => ({
  capacity: '1',
  chan_point: outpoint,
  channel_id: chanNumber({channel}).number,
  node1_pub: node1,
  node2_pub: node2,
});

const makeLnd = ({channels, getChanInfo, listChannels}) => ({
  default: {
    getChanInfo: getChanInfo || (({}, cbk) => {
      return cbk({details: 'edge not found'});
    }),
    listChannels: listChannels || (({}, cbk) => cbk(null, {channels})),
  },
});

const tests = [
  {
    args: {
      channel,
      id,
      lnd: makeLnd({
        channels: [
          makeChannel({number: chanNumber({channel}).number, partner: peer}),
        ],
        getChanInfo: ({}, cbk) => cbk('UnexpectedGraphLookup'),
      }),
    },
    description: 'The peer of a channel of the node is found by the channel id',
    expected: {public_key: peer},
  },
  {
    args: {
      id,
      channel: alias,
      lnd: makeLnd({
        channels: [
          makeChannel({
            aliases: [chanNumber({channel: alias}).number],
            number: chanNumber({channel}).number,
            partner: peer,
          }),
        ],
        getChanInfo: ({}, cbk) => cbk('UnexpectedGraphLookup'),
      }),
    },
    description: 'The peer of a private channel is found by its channel alias',
    expected: {public_key: peer},
  },
  {
    args: {
      channel,
      id,
      lnd: makeLnd({
        channels: [],
        getChanInfo: ({}, cbk) => cbk(null, makeEdge([peer, id])),
      }),
    },
    description: 'The peer of a channel the node does not list is in the graph',
    expected: {public_key: peer},
  },
  {
    args: {
      channel,
      id,
      lnd: makeLnd({
        channels: [],
        getChanInfo: ({}, cbk) => cbk(null, makeEdge([id, peer])),
      }),
    },
    description: 'The graph peer is the other node when the node is node one',
    expected: {public_key: peer},
  },
  {
    args: {
      channel,
      id,
      lnd: makeLnd({
        channels: [makeChannel({number: '1', partner: other})],
        getChanInfo: ({}, cbk) => cbk(null, makeEdge([other, peer])),
      }),
    },
    description: 'A graph channel without the node has no peer',
    expected: {},
  },
  {
    args: {channel, id, lnd: makeLnd({channels: []})},
    description: 'A channel that is not found has no peer',
    expected: {},
  },
  {
    args: {
      channel,
      id,
      lnd: makeLnd({listChannels: ({}, cbk) => cbk('err')}),
    },
    description: 'An error getting the channels of the node is returned',
    error: [503, 'UnexpectedGetChannelsError', {err: 'err'}],
  },
  {
    args: {
      channel,
      id,
      lnd: makeLnd({channels: [], getChanInfo: ({}, cbk) => cbk('err')}),
    },
    description: 'An error getting the channel from the graph is returned',
    error: [503, 'UnexpectedGetChannelInfoError', {err: 'err'}],
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async () => {
    if (!!error) {
      await rejects(method(args), error, 'Got expected error');
    } else {
      deepStrictEqual(await method(args), expected, 'Got expected peer');
    }

    return;
  });
});
