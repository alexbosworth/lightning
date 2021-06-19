const {test} = require('@alexbosworth/tap');

const {infoAsWalletInfo} = require('./../../lnd_responses');

const makeInfo = overrides => {
  const info = {
    alias: 'alias',
    best_header_timestamp: 1,
    block_hash: '00',
    block_height: 1,
    chains: [{chain: 'chain', network: 'network'}],
    color: '#000000',
    features: {'1': {is_known: true, is_required: false}},
    identity_pubkey: Buffer.alloc(33).toString('hex'),
    num_active_channels: 1,
    num_peers: 1,
    num_pending_channels: 1,
    synced_to_chain: true,
    uris: [],
    version: 'version',
  };

  Object.keys(overrides).forEach(k => info[k] = overrides[k]);

  return info;
};

const tests = [
  {
    description: 'Wallet info is expected',
    error: 'ExpectedWalletResponse',
  },
  {
    args: makeInfo({alias: undefined}),
    description: 'Alias is expected',
    error: 'ExpectedWalletAlias',
  },
  {
    args: makeInfo({best_header_timestamp: undefined}),
    description: 'Best header timestamp expected',
    error: 'ExpectedBestHeaderTimestampInInfoResponse',
  },
  {
    args: makeInfo({block_hash: undefined}),
    description: 'Best block hash expected',
    error: 'ExpectedCurrentBlockHash',
  },
  {
    args: makeInfo({block_height: undefined}),
    description: 'Best block height expected',
    error: 'ExpectedBlockHeight',
  },
  {
    args: makeInfo({chains: undefined}),
    description: 'Chains expected',
    error: 'ExpectedChainsAssociatedWithWallet',
  },
  {
    args: makeInfo({color: undefined}),
    description: 'Color is expected',
    error: 'ExpectedWalletColorInWalletInfoResponse',
  },
  {
    args: makeInfo({features: undefined}),
    description: 'Features are expected',
    error: 'ExpectedFeaturesMapInWalletInfoResponse',
  },
  {
    args: makeInfo({identity_pubkey: undefined}),
    description: 'Node key is expected',
    error: 'ExpectedIdentityPubkey',
  },
  {
    args: makeInfo({num_active_channels: undefined}),
    description: 'Active channels count is expected',
    error: 'ExpectedNumActiveChannels',
  },
  {
    args: makeInfo({num_peers: undefined}),
    description: 'Peers count is expected',
    error: 'ExpectedNumPeers',
  },
  {
    args: makeInfo({num_pending_channels: undefined}),
    description: 'Pending count is expected',
    error: 'ExpectedNumPendingChannels',
  },
  {
    args: makeInfo({synced_to_chain: undefined}),
    description: 'Synced to chain is expected',
    error: 'ExpectedSyncedToChainStatus',
  },
  {
    args: makeInfo({uris: undefined}),
    description: 'URIs is expected',
    error: 'ExpectedArrayOfUrisInWalletInfoResponse',
  },
  {
    args: makeInfo({version: undefined}),
    description: 'Version is expected',
    error: 'ExpectedWalletLndVersion',
  },
  {
    args: makeInfo({}),
    description: 'Info is mapped',
    expected: {
      chains: [],
      color: '#000000',
      active_channels_count: 1,
      alias: 'alias',
      current_block_hash: '00',
      current_block_height: 1,
      features: [{
        bit: 1,
        is_known: true,
        is_required: false,
        type: 'data_loss_protection',
      }],
      is_synced_to_chain: true,
      is_synced_to_graph: undefined,
      latest_block_at: '1970-01-01T00:00:01.000Z',
      peers_count: 1,
      pending_channels_count: 1,
      public_key: '000000000000000000000000000000000000000000000000000000000000000000',
      uris: [],
      version: 'version',
    },
  },
  {
    args: makeInfo({synced_to_graph: true}),
    description: 'Synced to chain is true',
    expected: {
      chains: [],
      color: '#000000',
      active_channels_count: 1,
      alias: 'alias',
      current_block_hash: '00',
      current_block_height: 1,
      features: [{
        bit: 1,
        is_known: true,
        is_required: false,
        type: 'data_loss_protection',
      }],
      is_synced_to_chain: true,
      is_synced_to_graph: true,
      latest_block_at: '1970-01-01T00:00:01.000Z',
      peers_count: 1,
      pending_channels_count: 1,
      public_key: '000000000000000000000000000000000000000000000000000000000000000000',
      uris: [],
      version: 'version',
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, ({end, strictSame, throws}) => {
    if (!!error) {
      throws(() => infoAsWalletInfo(args), new Error(error), 'Got error');
    } else {
      strictSame(infoAsWalletInfo(args), expected, 'Info as wallet info');
    }

    return end();
  });
});
