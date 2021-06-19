const {test} = require('@alexbosworth/tap');

const {addPeer} = require('./../../../');

const makeLnd = args => {
  const peersRes = {
    peers: [
      {
        address: 'address',
        bytes_recv: '0',
        bytes_sent: '0',
        features: {},
        flap_count: 0,
        inbound: false,
        last_flap_ns: '0',
        ping_time: '0',
        pub_key: Buffer.alloc(33).toString('hex'),
        sat_recv: '0',
        sat_sent: '0',
        sync_type: 'ACTIVE_SYNC',
      },
      {
        address: 'address',
        bytes_recv: '0',
        bytes_sent: '0',
        features: {},
        flap_count: 0,
        inbound: false,
        last_flap_ns: '0',
        ping_time: '0',
        pub_key: Buffer.alloc(33, 1).toString('hex'),
        sat_recv: '0',
        sat_sent: '0',
        sync_type: 'ACTIVE_SYNC',
      },
    ],
  };

  const listPeersResponse = args.list_peers_res || peersRes;

  return {
    default: {
      connectPeer: ({}, cbk) => cbk(args.err, {}),
      listPeers: ({}, cbk) => cbk(args.list_peers_err, listPeersResponse),
    },
  };
};

const makeArgs = overrides => {
  const args = {
    is_temporary: true,
    lnd: makeLnd({}),
    public_key: Buffer.alloc(33).toString('hex'),
    retry_count: 1,
    retry_delay: 1,
    socket: 'socket',
  };

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const tests = [
  {
    args: makeArgs({lnd: undefined}),
    description: 'LND is required',
    error: [400, 'ExpectedLndToAddPeer'],
  },
  {
    args: makeArgs({public_key: undefined}),
    description: 'Peer public key is required',
    error: [400, 'ExpectedPublicKeyOfPeerToAdd'],
  },
  {
    args: makeArgs({public_key: '00'}),
    description: 'Full length peer public key is required',
    error: [400, 'ExpectedPublicKeyOfPeerToAdd'],
  },
  {
    args: makeArgs({socket: undefined}),
    description: 'Peer socket is required',
    error: [400, 'ExpectedHostAndPortOfPeerToAdd'],
  },
  {
    args: makeArgs({lnd: makeLnd({err: {message: 'already.connected.to'}})}),
    description: 'Already connected returns early',
  },
  {
    args: makeArgs({lnd: makeLnd({err: {message: 'connection.to.self'}})}),
    description: 'Connection to self returns early',
  },
  {
    args: makeArgs({
      lnd: makeLnd({
        err: {
          details: 'chain backend is still syncing, server not active yet',
        },
      }),
    }),
    description: 'Still syncing returns known error',
    error: [503, 'FailedToAddPeerBecausePeerStillSyncing'],
  },
  {
    args: makeArgs({lnd: makeLnd({err: 'err'})}),
    description: 'Random error returns error',
    error: [503, 'UnexpectedErrorAddingPeer', {err: 'err'}],
  },
  {
    args: makeArgs({lnd: makeLnd({list_peers_err: 'err'})}),
    description: 'List peers error returns error',
    error: [503, 'UnexpectedGetPeersError', {err: 'err'}],
  },
  {
    args: makeArgs({lnd: makeLnd({list_peers_res: {peers: []}})}),
    description: 'Empty list peers returns error',
    error: [503, 'FailedToSuccessfullyConnectToRemotePeer'],
  },
  {
    args: makeArgs({}),
    description: 'Peer is added',
  },
  {
    args: makeArgs({is_temporary: false, retry_delay: 0, timeout: 1}),
    description: 'Peer is added with no retry delay',
  },
  {
    args: makeArgs({retry_count: undefined, retry_delay: 1}),
    description: 'Peer is added with no retry count',
  },
];

tests.forEach(({args, description, error}) => {
  return test(description, async ({deepEqual, end, equal, rejects}) => {
    if (!!error) {
      await rejects(addPeer(args), error, 'Got expected error');
    } else {
      await addPeer(args);
    }

    return end();
  });
});
