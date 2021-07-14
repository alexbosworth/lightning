const {test} = require('@alexbosworth/tap');

const {forwardFromHtlcEvent} = require('./../../lnd_responses');

const makeInfo = overrides => {
  const info = {
    incoming_amt_msat: '2',
    incoming_timelock: 2,
    outgoing_amt_msat: '1',
    outgoing_timelock: 1,
  };

  Object.keys(overrides).forEach(k => info[k] = overrides[k]);

  return info;
};

const makeLinkFailEvent = overrides => {
  const event = {
    failure_detail: 'failure_detail',
    failure_string: 'failure_string',
    info: makeInfo({}),
    wire_failure: 'wire_failure',
  };

  Object.keys(overrides).forEach(k => event[k] = overrides[k]);

  return event;
};

const makeForwardEvent = overrides => {
  const event = makeInfo(overrides);

  return {info: event};
};

const makeHtlc = overrides => {
  const htlc = {
    event_type: 'FORWARD',
    forward_event: makeForwardEvent({}),
    incoming_channel_id: '1',
    incoming_htlc_id: '0',
    outgoing_channel_id: '2',
    outgoing_htlc_id: '1',
    timestamp_ns: 1e8,
  };

  Object.keys(overrides).forEach(k => htlc[k] = overrides[k]);

  return htlc;
};

const makeExpected = overrides => {
  const expected = {
    at: '1970-01-01T00:00:00.100Z',
    cltv_delta: 1,
    external_failure: undefined,
    fee: 0,
    fee_mtokens: '1',
    in_channel: '0x0x1',
    in_payment: 0,
    internal_failure: undefined,
    is_confirmed: false,
    is_failed: false,
    is_receive: false,
    is_send: false,
    mtokens: '1',
    out_channel: '0x0x2',
    out_payment: 1,
    secret: undefined,
    timeout: 1,
    tokens: 0,
  };

  Object.keys(overrides).forEach(k => expected[k] = overrides[k]);

  return expected;
};

const tests = [
  {
    args: makeHtlc({event_type: undefined}),
    description: 'An event type is expected',
    error: 'ExpectedHtlcEventTypeToDeriveForwardFromHtlcEvent',
  },
  {
    args: makeHtlc({forward_event: {}}),
    description: 'Forward event info is expected',
    error: 'ExpectedHtlcInfoInForwardEvent',
  },
  {
    args: makeHtlc({
      forward_event: makeForwardEvent({incoming_amt_msat: undefined}),
    }),
    description: 'Forward event incoming msat is expected',
    error: 'ExpectedForwardEventIncomingAmountMsatToDeriveForward',
  },
  {
    args: makeHtlc({
      forward_event: makeForwardEvent({incoming_timelock: undefined}),
    }),
    description: 'Forward event incoming timelock is expected',
    error: 'ExpectedForwardEventIncomingTimelockToDeriveForward',
  },
  {
    args: makeHtlc({
      forward_event: makeForwardEvent({outgoing_amt_msat: undefined}),
    }),
    description: 'Forward event outgoing msat is expected',
    error: 'ExpectedForwardEventOutgoingAmountMsatToDeriveForward',
  },
  {
    args: makeHtlc({
      forward_event: makeForwardEvent({outgoing_timelock: undefined}),
    }),
    description: 'Forward event outgoing timelock is expected',
    error: 'ExpectedForwardEventOutgoingTimelockToDeriveForward',
  },
  {
    args: makeHtlc({incoming_channel_id: undefined}),
    description: 'Incoming channel id is expected',
    error: 'ExpectedIncomingChannelIdToDeriveForward',
  },
  {
    args: makeHtlc({incoming_htlc_id: undefined}),
    description: 'Incoming htlc id is expected',
    error: 'ExpectedIncomingHtlcIdToDeriveForward',
  },
  {
    args: makeHtlc({
      link_fail_event: makeLinkFailEvent({failure_detail: undefined}),
    }),
    description: 'Failure detail in link failure event is expected',
    error: 'ExpectedLinkFailureDetailInLinkFailureEvent',
  },
  {
    args: makeHtlc({
      link_fail_event: makeLinkFailEvent({failure_string: undefined}),
    }),
    description: 'Failure string in link failure event is expected',
    error: 'ExpectedLinkFailureStringInLinkFailureEvent',
  },
  {
    args: makeHtlc({link_fail_event: makeLinkFailEvent({info: undefined})}),
    description: 'Failure info in link failure event is expected',
    error: 'ExpectedHtlcInfoInLinkFailEvent',
  },
  {
    args: makeHtlc({
      link_fail_event: makeLinkFailEvent({
        info: makeInfo({incoming_amt_msat: undefined}),
      }),
    }),
    description: 'Incoming msat is expected in link fail event',
    error: 'ExpectedLinkFailEventIncomingMsatToDeriveForward',
  },
  {
    args: makeHtlc({
      link_fail_event: makeLinkFailEvent({
        info: makeInfo({incoming_timelock: undefined}),
      }),
    }),
    description: 'Incoming timelock is expected in link fail event',
    error: 'ExpectedLinkFailEventIncomingTimelockToDeriveForward',
  },
  {
    args: makeHtlc({
      link_fail_event: makeLinkFailEvent({
        info: makeInfo({outgoing_amt_msat: undefined}),
      }),
    }),
    description: 'Outgoing amount msat is expected in link fail event',
    error: 'ExpectedLinkFailEventOutgoingMsatToDeriveForward',
  },
  {
    args: makeHtlc({
      link_fail_event: makeLinkFailEvent({
        info: makeInfo({outgoing_timelock: undefined}),
      }),
    }),
    description: 'Outgoing timelock is expected in link fail event',
    error: 'ExpectedForwardEventOutgoingTimelockToDeriveForward',
  },
  {
    args: makeHtlc({settle_event: {}}),
    description: 'A preimage is expected when a settle event is emitted',
    error: 'ExpectedHtlcPreimageInForwardedSettleEvent',
  },
  {
    args: makeHtlc({outgoing_channel_id: undefined}),
    description: 'Outgoing channel id is expected',
    error: 'ExpectedOutgoingChannelIdToDeriveForward',
  },
  {
    args: makeHtlc({outgoing_htlc_id: undefined}),
    description: 'Outgoing htlc id is expected',
    error: 'ExpectedOutgoingHtlcIdToDeriveForward',
  },
  {
    args: makeHtlc({timestamp_ns: undefined}),
    description: 'Timestamp nanoseconds is expected',
    error: 'ExpectedHtlcTimestampToDeriveForward',
  },
  {
    args: makeHtlc({forward_event: undefined}),
    description: 'An HTLC event is expected',
    error: 'ExpectedForwardEventOrLinkFailEventInHtlcEvent',
  },
  {
    args: makeHtlc({}),
    description: 'HTLC event mapped to forward',
    expected: makeExpected({}),
  },
  {
    args: makeHtlc({
      forward_event: undefined,
      link_fail_event: makeLinkFailEvent({}),
    }),
    description: 'Link fail event mapped to forward',
    expected: makeExpected({
      external_failure: 'wire_failure',
      internal_failure: 'failure_detail',
      is_failed: true,
    }),
  },
  {
    args: makeHtlc({
      event_type: 'RECEIVE',
      forward_event: undefined,
      link_fail_event: makeLinkFailEvent({}),
    }),
    description: 'Link fail receive event mapped to forward',
    expected: makeExpected({
      cltv_delta: undefined,
      external_failure: 'wire_failure',
      fee: undefined,
      fee_mtokens: undefined,
      internal_failure: 'failure_detail',
      is_failed: true,
      is_receive: true,
      mtokens: undefined,
      out_channel: undefined,
      out_payment: undefined,
      timeout: undefined,
      tokens: undefined,
    }),
  },
  {
    args: makeHtlc({event_type: 'SEND'}),
    description: 'HTLC event mapped to forward',
    expected: makeExpected({
      cltv_delta: undefined,
      fee: undefined,
      fee_mtokens: undefined,
      in_channel: undefined,
      in_payment: undefined,
      is_send: true,
    }),
  },
  {
    args: makeHtlc({
      event_type: 'SEND',
      forward_event: undefined,
      settle_event: {preimage: Buffer.alloc(32, 1)},
    }),
    description: 'HTLC send settle mapped to forward',
    expected: makeExpected({
      cltv_delta: undefined,
      fee: undefined,
      fee_mtokens: undefined,
      in_channel: undefined,
      in_payment: undefined,
      is_confirmed: true,
      is_send: true,
      mtokens: undefined,
      secret: '0101010101010101010101010101010101010101010101010101010101010101',
      timeout: undefined,
      tokens: undefined,
    }),
  },
  {
    args: makeHtlc({
      event_type: 'RECEIVE',
      forward_event: undefined,
      settle_event: {preimage: Buffer.alloc(0)},
    }),
    description: 'HTLC receive settle mapped to forward',
    expected: makeExpected({
      cltv_delta: undefined,
      fee: undefined,
      fee_mtokens: undefined,
      is_confirmed: true,
      is_receive: true,
      mtokens: undefined,
      out_channel: undefined,
      out_payment: undefined,
      timeout: undefined,
      tokens: undefined,
    }),
  },
  {
    args: makeHtlc({forward_fail_event: {}}),
    description: 'HTLC forward fail event event mapped to forward',
    expected: makeExpected({
      cltv_delta: undefined,
      external_failure: undefined,
      fee: undefined,
      fee_mtokens: undefined,
      internal_failure: undefined,
      is_failed: true,
      mtokens: undefined,
      timeout: undefined,
      tokens: undefined,
    }),
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, ({end, strictSame, throws}) => {
    if (!!error) {
      throws(() => forwardFromHtlcEvent(args), new Error(error), 'Got err');
    } else {
      strictSame(forwardFromHtlcEvent(args), expected, 'HTLC as forward');
    }

    return end();
  });
});
