const {createCipheriv} = require('node:crypto');
const {createECDH} = require('node:crypto');
const {createHash} = require('node:crypto');
const {createHmac} = require('node:crypto');
const {deepStrictEqual} = require('node:assert').strict;
const {promisify} = require('node:util');
const {rejects} = require('node:assert').strict;
const test = require('node:test');

const {chanNumber} = require('bolt07');
const {decryptBlindedPath} = require('bolt04');
const {paymentPathFromChannels} = require('bolt04');
const {rawChanId} = require('bolt07');

const method = require('./../../../lnd_methods/offchain/blinded_path_past_self');

const alias = '16000000x0x1';
const blockHeight = 100;
const byType = (a, b) => Number(a.type) - Number(b.type);
const channel = '1x2x3';
const finalCltvDelta = 18;
const hexAsBuffer = hex => Buffer.from(hex, 'hex');
const maxMtokens = '100000000';
const outpoint = `${Buffer.alloc(32).toString('hex')}:0`;
const sha256 = n => createHash('sha256').update(n).digest();
const stepPastSelf = promisify(method);

// The public key of a private key number
const publicKeyFor = number => {
  const ecdh = createECDH('secp256k1');

  ecdh.setPrivateKey(hexAsBuffer(number.toString(16).padStart(64, '0')));

  return ecdh.getPublicKey('hex', 'compressed');
};

// The node has private key one so its shared point with a path key is the key
const self = publicKeyFor(1);
const peer = publicKeyFor(2);
const other = publicKeyFor(3);

// LND derives a shared secret as the hash of the shared point
const secretFor = key => sha256(hexAsBuffer(key));

// The forwarding policy of a node
const policy = key => ({
  base_fee_mtokens: '1000',
  cltv_delta: 40,
  fee_rate: 100,
  max_htlc_mtokens: maxMtokens,
  min_htlc_mtokens: '1',
  public_key: key,
});

// A path that starts at the node and goes over a channel to the peer
const makePath = ({hops, id}) => paymentPathFromChannels({
  channels: [{id: id || channel, policies: [policy(self), policy(peer)]}],
  cltv_delta: finalCltvDelta,
  current_block_height: blockHeight,
  destination: peer,
  hop_count: hops,
  max_mtokens: maxMtokens,
});

// A path that starts at the peer and goes over a channel to another node
const peerPath = paymentPathFromChannels({
  channels: [{id: '4x5x6', policies: [policy(peer), policy(other)]}],
  cltv_delta: finalCltvDelta,
  current_block_height: blockHeight,
  destination: other,
  max_mtokens: maxMtokens,
});

// A path to the node itself, with dummy hops when there are more hops
const pathToSelf = hops => paymentPathFromChannels({
  channels: [],
  cltv_delta: finalCltvDelta,
  current_block_height: blockHeight,
  destination: self,
  hop_count: hops,
  max_mtokens: maxMtokens,
});

// The next path key from the hop of the node at the start of a path
const nextKey = path => decryptBlindedPath({
  encrypted: path.hops[0].encrypted_data,
  key: path.key,
  secret: secretFor(path.key).toString('hex'),
}).next_path_key;

// Hop data records that tell the next channel, next node and payment relay
const channelRecord = id => ({type: '2', value: rawChanId({channel: id}).id});
const nodeRecord = key => ({type: '4', value: key});

const relayRecord = cltvDelta => {
  const relay = Buffer.alloc(8);

  // CLTV delta, a fee rate of 100 and a truncated base fee of 1000
  relay.writeUInt16BE(cltvDelta);
  relay.writeUInt32BE(100, 2);
  relay.writeUInt16BE(1000, 6);

  return {type: '10', value: relay.toString('hex')};
};

// Payment relay data of a CLTV delta of 40, fee rate of 100, and no base fee
const noBaseFeeRelayRecord = {type: '10', value: '002800000064'};

// Payment relay data that stops after the CLTV delta
const shortRelayRecord = {type: '10', value: '0028'};

// Payment relay data with a base fee that is longer than a u32
const longRelayRecord = {type: '10', value: '0028000000640000000001'};

// Encrypt hop data records for the node at a path key
const encryptForSelf = ({key, records}) => {
  // Hop data is a stream of type, length and value records, ordered by type
  const data = Buffer.concat(records.slice().sort(byType).map(record => {
    const value = hexAsBuffer(record.value);

    const header = Buffer.from([Number(record.type), value.length]);

    return Buffer.concat([header, value]);
  }));

  // Hop data is encrypted with the rho key derived from the shared secret
  const rho = createHmac('sha256', 'rho').update(secretFor(key)).digest();

  const cipher = createCipheriv('chacha20-poly1305', rho, Buffer.alloc(12), {
    authTagLength: 16,
  });

  const encrypted = [cipher.update(data), cipher.final(), cipher.getAuthTag()];

  return Buffer.concat(encrypted).toString('hex');
};

// Put hops of the node with a CLTV delta of 40 in front of a path to the peer
const throughSelf = hops => {
  // Each hop of the node overrides the next path key to the key after it
  const keys = hops.map((n, i) => publicKeyFor(i + 10)).concat(peerPath.key);

  return {
    base_fee_mtokens: peerPath.base_fee_mtokens,
    cltv_delta: peerPath.cltv_delta + 40 * hops.length,
    fee_rate: peerPath.fee_rate,
    hops: hops.map((records, i) => ({
      encrypted_data: encryptForSelf({
        key: keys[i],
        records: records.concat({type: '8', value: keys[i + 1]}),
      }),
      relay_key: self,
    }))
    .concat(peerPath.hops),
    introduction_node: self,
    key: keys[0],
    max_htlc_mtokens: peerPath.max_htlc_mtokens,
    min_htlc_mtokens: peerPath.min_htlc_mtokens,
  };
};

// The path to the peer past the hops of the node, sent an amount past the node
const pastSelf = mtokens => ({
  mtokens,
  path: {
    base_fee_mtokens: '1000',
    cltv_delta: 58,
    fee_rate: 100,
    hops: peerPath.hops,
    introduction_node: peer,
    key: peerPath.key,
    max_htlc_mtokens: maxMtokens,
    min_htlc_mtokens: '1',
  },
});

// A channel of the node as LND lists it
const makeChannel = ({aliases, id}) => ({
  active: true,
  alias_scids: (aliases || []).map(n => chanNumber({channel: n}).number),
  capacity: '1',
  chan_id: chanNumber({channel: id}).number,
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
  remote_pubkey: peer,
  thaw_height: 0,
  total_satoshis_received: '1',
  total_satoshis_sent: '1',
  unsettled_balance: '1',
});

const makeLnd = overrides => {
  const lnd = {
    default: {
      getChanInfo: ({}, cbk) => cbk({details: 'edge not found'}),
      listChannels: ({}, cbk) => {
        return cbk(null, {channels: [makeChannel({id: channel})]});
      },
    },
    signer: {
      deriveSharedKey: ({ephemeral_pubkey}, cbk) => {
        return cbk(null, {shared_key: sha256(ephemeral_pubkey)});
      },
    },
  };

  Object.assign(lnd.default, overrides || {});

  return lnd;
};

// LND that has no answer for anything
const failingLnd = {
  default: {
    getChanInfo: ({}, cbk) => cbk('err'),
    listChannels: ({}, cbk) => cbk('err'),
  },
  signer: {deriveSharedKey: ({}, cbk) => cbk('err')},
};

const ownPath = makePath({});
const aliasPath = makePath({hops: 3, id: alias});
const graphPath = makePath({});

const tests = [
  {
    args: {id: other, lnd: failingLnd, mtokens: '2000', path: ownPath},
    description: 'A path that does not start at the node is not changed',
    expected: {mtokens: '2000', path: ownPath},
  },
  {
    args: {id: self, lnd: makeLnd(), mtokens: '1001100', path: ownPath},
    description: 'A path that starts at the node goes over its own channel',
    expected: {
      mtokens: '1000000',
      path: {
        base_fee_mtokens: '1000',
        cltv_delta: finalCltvDelta,
        fee_rate: 100,
        hops: ownPath.hops.slice(1),
        introduction_node: peer,
        key: nextKey(ownPath),
        max_htlc_mtokens: maxMtokens,
        min_htlc_mtokens: '1',
      },
    },
  },
  {
    args: {
      id: self,
      lnd: makeLnd({
        listChannels: ({}, cbk) => cbk(null, {
          channels: [makeChannel({aliases: [alias], id: '2x2x2'})],
        }),
      }),
      mtokens: '2000',
      path: aliasPath,
    },
    description: 'A path that starts at the node goes over a channel alias',
    expected: {
      mtokens: '1000',
      path: {
        base_fee_mtokens: '1000',
        cltv_delta: finalCltvDelta,
        fee_rate: 100,
        hops: aliasPath.hops.slice(1),
        introduction_node: peer,
        key: nextKey(aliasPath),
        max_htlc_mtokens: maxMtokens,
        min_htlc_mtokens: '1',
      },
    },
  },
  {
    args: {
      id: self,
      lnd: makeLnd({
        getChanInfo: ({}, cbk) => cbk(null, {
          capacity: '1',
          chan_point: outpoint,
          channel_id: chanNumber({channel}).number,
          node1_pub: peer,
          node2_pub: self,
        }),
        listChannels: ({}, cbk) => cbk(null, {channels: []}),
      }),
      mtokens: '2000',
      path: graphPath,
    },
    description: 'The next channel is looked for in the graph',
    expected: {
      mtokens: '1000',
      path: {
        base_fee_mtokens: '1000',
        cltv_delta: finalCltvDelta,
        fee_rate: 100,
        hops: graphPath.hops.slice(1),
        introduction_node: peer,
        key: nextKey(graphPath),
        max_htlc_mtokens: maxMtokens,
        min_htlc_mtokens: '1',
      },
    },
  },
  {
    args: {
      id: self,
      lnd: makeLnd({listChannels: ({}, cbk) => cbk(null, {channels: []})}),
      mtokens: '2000',
      path: ownPath,
    },
    description: 'A path is left out when the next peer is not found',
    expected: {},
  },
  {
    args: {
      id: self,
      lnd: makeLnd({listChannels: ({}, cbk) => cbk('UnexpectedLookup')}),
      mtokens: '2000',
      path: throughSelf([[nodeRecord(peer), relayRecord(40)]]),
    },
    description: 'A path that starts at the node goes to a given next node',
    expected: pastSelf('1000'),
  },
  {
    args: {
      id: self,
      lnd: makeLnd(),
      mtokens: '2000',
      path: Object.assign(throughSelf([[nodeRecord(peer), relayRecord(40)]]), {
        introduction_node: undefined,
      }),
    },
    description: 'A path with no introduction node starts at the first hop',
    expected: pastSelf('1000'),
  },
  {
    args: {
      id: self,
      lnd: makeLnd(),
      mtokens: '3000',
      path: throughSelf([
        [nodeRecord(self), relayRecord(40)],
        [channelRecord(channel), relayRecord(40)],
      ]),
    },
    description: 'Repeated hops of the node are all stepped past',
    expected: pastSelf('1000'),
  },
  {
    args: {
      id: self,
      lnd: makeLnd(),
      mtokens: '1000100',
      path: throughSelf([[nodeRecord(peer), noBaseFeeRelayRecord]]),
    },
    description: 'A hop of the node with no base fee forwards by its fee rate',
    expected: pastSelf('1000000'),
  },
  {
    args: {id: self, lnd: makeLnd(), mtokens: '2000', path: pathToSelf(3)},
    description: 'A path that ends at the node is a payment to the node',
    error: [400, 'CannotPayToOwnNodeViaBlindedPath'],
  },
  {
    args: {id: self, lnd: failingLnd, mtokens: '2000', path: pathToSelf()},
    description: 'A path that is only the node is a payment to the node',
    error: [400, 'CannotPayToOwnNodeViaBlindedPath'],
  },
  {
    args: {
      id: self,
      lnd: makeLnd(),
      mtokens: '2000',
      path: Object.assign({}, ownPath, {
        hops: [{encrypted_data: '00'.repeat(32), relay_key: self}]
          .concat(ownPath.hops.slice(1)),
      }),
    },
    description: 'A path is left out when the hop cannot be decrypted',
    expected: {},
  },
  {
    args: {
      id: self,
      lnd: failingLnd,
      mtokens: '2000',
      path: Object.assign({}, ownPath, {key: `02${'05'.repeat(32)}`}),
    },
    description: 'A path is left out when its path key is not a point',
    expected: {},
  },
  {
    args: {
      id: self,
      lnd: makeLnd(),
      mtokens: '2000',
      path: throughSelf([[nodeRecord(peer)]]),
    },
    description: 'A path is left out when the hop has no payment relay',
    expected: {},
  },
  {
    args: {
      id: self,
      lnd: makeLnd(),
      mtokens: '2000',
      path: throughSelf([[nodeRecord(peer), shortRelayRecord]]),
    },
    description: 'A path is left out when the hop payment relay is too short',
    expected: {},
  },
  {
    args: {
      id: self,
      lnd: makeLnd(),
      mtokens: '2000',
      path: throughSelf([[nodeRecord(peer), longRelayRecord]]),
    },
    description: 'A path is left out when the hop payment relay is too long',
    expected: {},
  },
  {
    args: {id: self, lnd: makeLnd(), mtokens: '999', path: ownPath},
    description: 'A path is left out when the amount is under the hop base fee',
    expected: {},
  },
  {
    args: {
      id: self,
      lnd: makeLnd(),
      mtokens: '2000',
      path: Object.assign(throughSelf([[nodeRecord(peer), relayRecord(40)]]), {
        cltv_delta: 39,
      }),
    },
    description: 'A path with a CLTV delta under the hop delta is left out',
    expected: {},
  },
  {
    args: {
      id: self,
      lnd: makeLnd(),
      mtokens: '2000',
      path: throughSelf([[relayRecord(40)]]),
    },
    description: 'A path is left out when the hop has no next hop',
    expected: {},
  },
  {
    args: {id: self, lnd: failingLnd, mtokens: '2000', path: ownPath},
    description: 'An error deriving the shared secret is returned',
    error: [503, 'UnexpetedErrorDerivingSharedKey', {err: 'err'}],
  },
  {
    args: {
      id: self,
      lnd: makeLnd({listChannels: ({}, cbk) => cbk('err')}),
      mtokens: '2000',
      path: ownPath,
    },
    description: 'An error getting the channels of the node is returned',
    error: [503, 'UnexpectedGetChannelsError', {err: 'err'}],
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async () => {
    if (!!error) {
      await rejects(stepPastSelf(args), error, 'Got expected error');
    } else {
      deepStrictEqual(await stepPastSelf(args), expected, 'Got path');
    }

    return;
  });
});
