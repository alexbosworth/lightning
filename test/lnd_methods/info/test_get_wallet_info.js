const {test} = require('@alexbosworth/tap');

const {getInfoResponse} = require('./../fixtures');
const {getWalletInfo} = require('./../../../');

const makeLnd = ({custom, err, res}) => {
  const response = getInfoResponse;

  return {
    default: {
      getInfo: ({}, cbk) => cbk(err, res !== undefined ? res : response),
    },
  };
};

const tests = [
  {
    args: {},
    description: 'LND is required to get info',
    error: [400, 'ExpectedAuthenticatedLndGrpcForGetInfoRequest'],
  },
  {
    args: {lnd: makeLnd({err: {details: 'unknown service lnrpc.Lightning'}})},
    description: 'Unknown service returns locked error',
    error: [503, 'LndLocked'],
  },
  {
    args: {
      lnd: makeLnd({err: {details: 'failed to connect to all addresses'}}),
    },
    description: 'Failed to connect returns error',
    error: [503, 'FailedToConnectToDaemon'],
  },
  {
    args: {lnd: makeLnd({err: {details: 'Connect Failed'}})},
    description: 'Connect fails returns error',
    error: [503, 'FailedToConnectToDaemon'],
  },
  {
    args: {lnd: makeLnd({err: 'err'})},
    description: 'Generic failure returns back the error',
    error: [503, 'GetWalletInfoErr', {err: 'err'}],
  },
  {
    args: {lnd: makeLnd({res: {}})},
    description: 'Valid result is expected',
    error: [503, 'ExpectedWalletAlias'],
  },
  {
    args: {
      lnd: makeLnd({
        err: {
          message: '14 UNAVAILABLE: channel is in state TRANSIENT_FAILURE',
        },
      }),
    },
    description: 'Channel failure message returns connect fail error',
    error: [503, 'FailedToConnectToDaemon'],
  },
  {
    args: {lnd: makeLnd({})},
    description: 'Info is returned',
    expected: {
      chains: [
        '6fe28c0ab6f1b372c1a6a246ae63f74f931e8365e15a089c68d6190000000000',
      ],
      color: '#000000',
      active_channels_count: 0,
      alias: '',
      current_block_hash: '00',
      current_block_height: 1,
      features: [{
        bit: 1,
        is_known: true,
        is_required: false,
        type: 'data_loss_protection',
      }],
      is_synced_to_chain: false,
      is_synced_to_graph: undefined,
      latest_block_at: '1970-01-01T00:00:01.000Z',
      peers_count: 0,
      pending_channels_count: 0,
      public_key: '020000000000000000000000000000000000000000000000000000000000000000',
      uris: [],
      version: '',
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, rejects, strictSame}) => {
    if (!!error) {
      await rejects(() => getWalletInfo(args), error, 'Got error');
    } else {
      strictSame(await getWalletInfo(args), expected, 'Got info');
    }

    return end();
  });
});
