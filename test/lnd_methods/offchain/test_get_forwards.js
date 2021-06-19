const {test} = require('@alexbosworth/tap');

const {getForwards} = require('./../../../');

const makeLnd = ({empty, err, overrides}) => {
  if (!!empty) {
    return {default: {forwardingHistory: ({}, cbk) => cbk()}};
  }

  const res = {
    forwarding_events: [{
      amt_in: '2',
      amt_in_msat: '2000',
      amt_out: '1',
      amt_out_msat: '1000',
      chan_id_in: '1',
      chan_id_out: '2',
      fee: '1',
      fee_msat: '1000',
      timestamp: '1',
      timestamp_ns: '1000000000',
    }],
    last_offset_index: '1',
  };

  Object.keys(overrides || {}).forEach(key => res[key] = overrides[key]);

  return {default: {forwardingHistory: ({}, cbk) => cbk(err, res)}};
};

const tests = [
  {
    args: {after: new Date().toISOString()},
    description: 'Both after and before are expected or neither',
    error: [400, 'ExpectedBeforeDateWhenUsingAfterDate'],
  },
  {
    args: {},
    description: 'LND is expected to get forwards',
    error: [400, 'ExpectedLndToGetForwardingHistory'],
  },
  {
    args: {limit: 1, lnd: makeLnd({}), token: 'token'},
    description: 'A limit is not expected when there is a paging token',
    error: [400, 'UnexpectedLimitWhenPagingForwardsWithToken'],
  },
  {
    args: {lnd: makeLnd({}), token: 'token'},
    description: 'A paging token is expected to be JSON',
    error: [400, 'ExpectedValidPagingToken'],
  },
  {
    args: {lnd: makeLnd({err: 'err'})},
    description: 'An error is returned',
    error: [503, 'GetForwardingHistoryError'],
  },
  {
    args: {lnd: makeLnd({empty: true})},
    description: 'A response is expected',
    error: [503, 'ExpectedForwardingHistoryResults'],
  },
  {
    args: {lnd: makeLnd({overrides: {forwarding_events: undefined}})},
    description: 'Forwarding events are expected',
    error: [503, 'ExpectedForwardingEvents'],
  },
  {
    args: {lnd: makeLnd({overrides: {last_offset_index: undefined}})},
    description: 'A last offset index is expected',
    error: [503, 'ExpectedLastIndexOffsetInForwardsResponse'],
  },
  {
    args: {lnd: makeLnd({overrides: {forwarding_events: [undefined]}})},
    description: 'Valid forwarding events are expected',
    error: [503, 'ExpectedRpcForwardToDeriveForward'],
  },
  {
    args: {lnd: makeLnd({})},
    description: 'Forwards are returned from get forwards',
    expected: {
      forwards: [{
        created_at: '1970-01-01T00:00:01.000Z',
        fee: 1,
        fee_mtokens: '1000',
        incoming_channel: '0x0x1',
        mtokens: '1000',
        outgoing_channel: '0x0x2',
        tokens: 1,
      }],
      next: '{"offset":"1","limit":100}',
    },
  },
  {
    args: {
      lnd: makeLnd({overrides: {forwarding_events: []}}),
      token: JSON.stringify({
        after: new Date(1).toISOString(),
        before: new Date(1).toISOString(),
        limit: 1,
        offset: 1,
      }),
    },
    description: 'Forwards are returned from get forwards with paging',
    expected: {
      forwards: [],
      next: undefined,
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, rejects, strictSame}) => {
    if (!!error) {
      await rejects(() => getForwards(args), error, 'Got expected error');
    } else {
      const res = await getForwards(args);

      strictSame(res, expected, 'Got expected result');
    }

    return end();
  });
});
