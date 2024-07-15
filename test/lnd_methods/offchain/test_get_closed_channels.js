const {deepStrictEqual} = require('node:assert').strict;
const {rejects} = require('node:assert').strict;
const test = require('node:test');

const {getClosedChannels} = require('./../../../');

const makeLnd = (err, override, response) => {
  const channel = {
    alias_scids: [],
    capacity: '1',
    chan_id: '1',
    channel_point: '00:1',
    close_height: 1,
    close_initiator: 'INITIATOR_REMOTE',
    closing_tx_hash: '00',
    open_initiator: 'INITIATOR_LOCAL',
    remote_pubkey: 'b',
    settled_balance: '1',
    time_locked_balance: '1',
  };

  Object.keys(override || {}).forEach(key => channel[key] = override[key]);

  const r = response !== undefined ? response : {channels: [channel]};

  return {default: {closedChannels: ({}, cbk) => cbk(err, r)}};
};

const makeArgs = ({override}) => {
  const args = {
    is_breach_close: false,
    is_cooperative_close: false,
    is_funding_cancel: false,
    is_local_force_close: false,
    is_remote_force_close: false,
    lnd: makeLnd(),
  };

  Object.keys(override || {}).forEach(key => args[key] = override[key]);

  return args;
};

const makeExpectedChannel = ({override}) => {
  const expected = {
    anchor_is_confirmed: undefined,
    anchor_is_pending: undefined,
    anchor_spent_by: undefined,
    anchor_vout: undefined,
    capacity: 1,
    close_balance_vout: undefined,
    close_balance_spent_by: undefined,
    close_confirm_height: 1,
    close_payments: [],
    close_transaction_id: '00',
    final_local_balance: 1,
    final_time_locked_balance: 1,
    id: '0x0x1',
    is_breach_close: false,
    is_cooperative_close: false,
    is_funding_cancel: false,
    is_local_force_close: false,
    is_partner_closed: true,
    is_partner_initiated: false,
    is_remote_force_close: false,
    other_ids: [],
    partner_public_key: 'b',
    transaction_id: '00',
    transaction_vout: 1,
  };

  Object.keys(override || {}).forEach(key => expected[key] = override[key]);

  return expected;
};

const tests = [
  {
    args: makeArgs({override: {lnd: undefined}}),
    description: 'LND is required',
    error: [400, 'ExpectedLndApiForGetClosedChannelsRequest'],
  },
  {
    args: makeArgs({override: {lnd: makeLnd('err')}}),
    description: 'Errors are passed back',
    error: [503, 'FailedToRetrieveClosedChannels', {err: 'err'}],
  },
  {
    args: makeArgs({override: {lnd: makeLnd(null, null, false)}}),
    description: 'A response is expected',
    error: [503, 'ExpectedResponseToGetCloseChannels'],
  },
  {
    args: makeArgs({override: {lnd: makeLnd(null, null, {})}}),
    description: 'A response with channels is expected',
    error: [503, 'ExpectedChannels'],
  },
  {
    args: makeArgs({override: {lnd: makeLnd(null, {alias_scids: undefined})}}),
    description: 'Alias scids are expected',
    error: [503, 'ExpectedArrayOfAliasShortChannelIds'],
  },
  {
    args: makeArgs({override: {lnd: makeLnd(null, {capacity: undefined})}}),
    description: 'Capacity is expected',
    error: [503, 'ExpectedCloseChannelCapacity'],
  },
  {
    args: makeArgs({override: {lnd: makeLnd(null, {chan_id: undefined})}}),
    description: 'Channel id is expected',
    error: [503, 'ExpectedChannelIdOfClosedChannel'],
  },
  {
    args: makeArgs({
      override: {lnd: makeLnd(null, {channel_point: undefined})},
    }),
    description: 'A channel point is expected',
    error: [503, 'ExpectedCloseChannelOutpoint'],
  },
  {
    args: makeArgs({
      override: {lnd: makeLnd(null, {close_height: undefined})}
    }),
    description: 'Channel cloes height is expected',
    error: [503, 'ExpectedChannelCloseHeight'],
  },
  {
    args: makeArgs({
      override: {lnd: makeLnd(null, {closing_tx_hash: undefined})},
    }),
    description: 'Closing TX hash is expected',
    error: [503, 'ExpectedClosingTransactionId'],
  },
  {
    args: makeArgs({
      override: {lnd: makeLnd(null, {remote_pubkey: undefined})},
    }),
    description: 'A remote public key is expected',
    error: [503, 'ExpectedCloseRemotePublicKey'],
  },
  {
    args: makeArgs({
      override: {lnd: makeLnd(null, {settled_balance: undefined})},
    }),
    description: 'Settled balance is required',
    error: [503, 'ExpectedFinalSettledBalance'],
  },
  {
    args: makeArgs({
      override: {lnd: makeLnd(null, {time_locked_balance: undefined})},
    }),
    description: 'Time locked balance is required',
    error: [503, 'ExpectedFinalTimeLockedBalanceForClosedChan'],
  },
  {
    args: makeArgs({}),
    description: 'Closed channels are returned',
    expected: {channels: [makeExpectedChannel({})]},
  },
  {
    args: makeArgs({
      override: {
        lnd: makeLnd(null, {
          alias_scids: ['2', '3'],
          zero_conf_confirmed_scid: '2',
        }),
      },
    }),
    description: 'Closed channels with alias scids is returned',
    expected: {
      channels: [
        makeExpectedChannel({override: {id: '0x0x2', other_ids: ['0x0x3']}}),
      ],
    },
  },
  {
    args: makeArgs({
      override: {lnd: makeLnd(null, {close_type: 'REMOTE_FORCE_CLOSE'})},
    }),
    description: 'Remote force close channel is returned',
    expected: {
      channels: [
        makeExpectedChannel({
          override: {is_partner_closed: true, is_remote_force_close: true},
        }),
      ],
    },
  },
  {
    args: makeArgs({
      override: {lnd: makeLnd(null, {close_type: 'LOCAL_FORCE_CLOSE'})},
    }),
    description: 'Local force close channel is returned',
    expected: {
      channels: [
        makeExpectedChannel({
          override: {is_partner_closed: false, is_local_force_close: true},
        }),
      ],
    },
  },
  {
    args: makeArgs({
      override: {lnd: makeLnd(null, {close_initiator: 'INITIATOR_LOCAL'})},
    }),
    description: 'Local close initiator is returned',
    expected: {
      channels: [
        makeExpectedChannel({
          override: {is_partner_closed: false, is_local_force_close: false},
        }),
      ],
    },
  },
  {
    args: makeArgs({
      override: {lnd: makeLnd(null, {close_initiator: 'UNKNOWN'})},
    }),
    description: 'Unknown close initiator is returned as undefined',
    expected: {
      channels: [
        makeExpectedChannel({override: {is_partner_closed: undefined}}),
      ],
    },
  },
  {
    args: makeArgs({
      override: {lnd: makeLnd(null, {open_initiator: 'UNKNOWN'})},
    }),
    description: 'Unknown open initiator is returned as undefined',
    expected: {
      channels: [
        makeExpectedChannel({override: {is_partner_initiated: undefined}}),
      ],
    },
  },
  {
    args: makeArgs({
      override: {lnd: makeLnd(null, {close_initiator: 'INITIATOR_REMOTE'})},
    }),
    description: 'Remote close initiator is returned',
    expected: {
      channels: [makeExpectedChannel({override: {is_partner_closed: true}})],
    },
  },
  {
    args: makeArgs({
      override: {lnd: makeLnd(null, {open_initiator: 'INITIATOR_REMOTE'})},
    }),
    description: 'Open initiator is returned',
    expected: {
      channels: [
        makeExpectedChannel({override: {is_partner_initiated: true}}),
      ],
    },
  },
  {
    args: makeArgs({
      override: {
        lnd: makeLnd(null, {
          closing_tx_hash: Buffer.alloc(32).toString('hex'),
        }),
      },
    }),
    description: 'An empty closing tx hash is returned as undefined',
    expected: {
      channels: [
        makeExpectedChannel({override: {close_transaction_id: undefined}}),
      ],
    },
  },
  {
    args: makeArgs({override: {lnd: makeLnd(null, {chan_id: '0'})}}),
    description: 'Empty chan id is returned as undefined',
    expected: {channels: [makeExpectedChannel({override: {id: undefined}})]},
  },
  {
    args: makeArgs({
      override: {
        lnd: makeLnd(null, {
          resolutions: [{
            amount_sat: '1',
            outcome: 'CLAIMED',
            outpoint: {
              output_index: 0,
              txid_str: Buffer.alloc(32).toString('hex'),
            },
            resolution_type: 'ANCHOR',
            sweep_txid: Buffer.alloc(32, 1).toString('hex'),
          }],
        }),
      },
    }),
    description: 'Anchor resolution maps to anchor status',
    expected: {
      channels: [
        makeExpectedChannel({override: {
          anchor_is_confirmed: true,
          anchor_is_pending: false,
          anchor_spent_by: Buffer.alloc(32, 1).toString('hex'),
          anchor_vout: 0,
        }}),
      ],
    },
  },
  {
    args: makeArgs({override: {lnd: makeLnd(null, {resolutions: [null]})}}),
    description: 'Valid resolutions are expected',
    error: [503, 'ExpectedRpcResolutionMessageToDeriveResolution'],
  },
  {
    args: makeArgs({override: {lnd: makeLnd(null, {close_height: 0})}}),
    description: 'Missing close height is returned as undefined',
    expected: {
      channels: [
        makeExpectedChannel({override: {close_confirm_height: undefined}}),
      ],
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async () => {
    if (!!error) {
      await rejects(getClosedChannels(args), error, 'Got expected error');
    } else {
      const {channels} = await getClosedChannels(args);

      deepStrictEqual(channels, expected.channels, 'Got expected channels');
    }

    return;
  });
});
