const {createECDH} = require('node:crypto');
const {createHash} = require('node:crypto');
const {deepStrictEqual} = require('node:assert').strict;
const {rejects} = require('node:assert').strict;
const test = require('node:test');

const {chanNumber} = require('bolt07');
const {decryptBlindedPath} = require('bolt04');
const {paymentPathFromChannels} = require('bolt04');

const method = require('./../../../lnd_methods/offchain/target_past_self');

const sha256 = n => createHash('sha256').update(n).digest();

// The public key of a private key number
const publicKeyFor = number => {
  const ecdh = createECDH('secp256k1');

  ecdh.setPrivateKey(Buffer.from(number.toString(16).padStart(64, '0'), 'hex'));

  return ecdh.getPublicKey('hex', 'compressed');
};

// The node has private key one so its shared point with a path key is the key
const self = publicKeyFor(1);
const peer = publicKeyFor(2);
const other = publicKeyFor(3);

// A path that starts at the node and goes over a channel to the peer
const makeSelfPath = channel => paymentPathFromChannels({
  channels: [{
    id: channel,
    policies: [self, peer].map(key => ({
      base_fee_mtokens: '1000',
      cltv_delta: 40,
      fee_rate: 100,
      max_htlc_mtokens: '100000000',
      min_htlc_mtokens: '1',
      public_key: key,
    })),
  }],
  cltv_delta: 18,
  current_block_height: 100,
  destination: peer,
  max_mtokens: '100000000',
});

const selfPath = makeSelfPath('1x2x3');

// A target that starts at the node, sent the amount and the path fee
const selfTarget = {
  cltv_delta: 58,
  destination: self,
  mtokens: '2000',
  path: selfPath,
};

// A target that starts at the node over a channel that is not known
const lostTarget = Object.assign({}, selfTarget, {path: makeSelfPath('9x9x9')});

// A target that starts at the node, sent nothing for the fee of the node
const underpaidTarget = Object.assign({}, selfTarget, {mtokens: '1000'});

// A target with a path that starts at another node
const otherTarget = {
  cltv_delta: 40,
  destination: other,
  mtokens: '1011',
  path: {hops: [{encrypted_data: '01', relay_key: other}], key: other},
};

// A target that is a destination, without a path
const destinationTarget = {cltv_delta: 40, destination: other, mtokens: '1000'};

// The target past the node is the peer, sent what the node would forward
const peerTarget = {
  cltv_delta: 18,
  destination: peer,
  mtokens: '1000',
  path: {
    base_fee_mtokens: '1000',
    cltv_delta: 18,
    fee_rate: 100,
    hops: selfPath.hops.slice(1),
    introduction_node: peer,
    key: decryptBlindedPath({
      encrypted: selfPath.hops[0].encrypted_data,
      key: selfPath.key,
      secret: sha256(Buffer.from(selfPath.key, 'hex')).toString('hex'),
    }).next_path_key,
    max_htlc_mtokens: '100000000',
    min_htlc_mtokens: '1',
  },
};

// Make an LND that finds the channel with the peer in the graph
const makeLnd = ({deriveSharedKey}) => ({
  default: {
    getChanInfo: ({chan_id}, cbk) => {
      // Exit early when the channel is not the channel with the peer
      if (chan_id !== chanNumber({channel: '1x2x3'}).number) {
        return cbk({details: 'edge not found'});
      }

      return cbk(null, {
        capacity: '1',
        chan_point: `${Buffer.alloc(32).toString('hex')}:0`,
        channel_id: chan_id,
        node1_pub: peer,
        node2_pub: self,
      });
    },
    listChannels: ({}, cbk) => cbk(null, {channels: []}),
  },
  signer: {
    deriveSharedKey: deriveSharedKey || (({ephemeral_pubkey}, cbk) => {
      return cbk(null, {shared_key: sha256(ephemeral_pubkey)});
    }),
  },
});

// LND that has no answer for anything
const failingLnd = {
  default: {
    getChanInfo: ({}, cbk) => cbk('err'),
    listChannels: ({}, cbk) => cbk('err'),
  },
  signer: {deriveSharedKey: ({}, cbk) => cbk('err')},
};

const tests = [
  {
    args: {
      id: self,
      lnd: failingLnd,
      mtokens: '1000',
      target: destinationTarget,
    },
    description: 'A target that is not a path is not changed',
    expected: {target: destinationTarget},
  },
  {
    args: {id: self, lnd: failingLnd, mtokens: '1000', target: otherTarget},
    description: 'A target with a path that starts at another node is kept',
    expected: {target: otherTarget},
  },
  {
    args: {id: self, lnd: makeLnd({}), mtokens: '1000', target: selfTarget},
    description: 'A target that starts at the node becomes the next node',
    expected: {target: peerTarget},
  },
  {
    args: {id: self, lnd: makeLnd({}), mtokens: '1000', target: lostTarget},
    description: 'A target that cannot be stepped past the node has no target',
    expected: {},
  },
  {
    args: {
      id: self,
      lnd: makeLnd({}),
      mtokens: '1000',
      target: underpaidTarget,
    },
    description: 'A target with fees under the fees of the node has no target',
    expected: {},
  },
  {
    args: {
      id: self,
      lnd: makeLnd({deriveSharedKey: ({}, cbk) => cbk('err')}),
      mtokens: '1000',
      target: selfTarget,
    },
    description: 'An error stepping past the node is returned',
    error: [503, 'UnexpetedErrorDerivingSharedKey', {err: 'err'}],
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async () => {
    if (!!error) {
      await rejects(method(args), error, 'Got expected error');
    } else {
      deepStrictEqual(await method(args), expected, 'Got expected target');
    }

    return;
  });
});
