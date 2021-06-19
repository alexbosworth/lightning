const {test} = require('@alexbosworth/tap');

const routeFromHint = require('./../../lnd_responses/route_from_route_hint');

const makeHopHint = overrides => {
  const hint = {
    chan_id: '1',
    cltv_expiry_delta: 1,
    fee_base_msat: '1',
    fee_proportional_millionths: '1',
    node_id: 'id',
  };

  Object.keys(overrides).forEach(k => hint[k] = overrides[k]);

  return hint;
};

const makeArgs = overrides => {
  const args = {destination: 'destination', hop_hints: [makeHopHint({})]};

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const tests = [
  {
    args: makeArgs({destination: undefined}),
    description: 'A destination is required',
    error: 'ExpectedPaymentRequestDestinationToCalculateRoute'
  },
  {
    args: makeArgs({hop_hints: undefined}),
    description: 'Hop hints are required',
    error: 'ExpectedRouteHopHints',
  },
  {
    args: makeArgs({hop_hints: []}),
    description: 'Non-empty hop hints are required',
    error: 'ExpectedRouteHopHints',
  },
  {
    args: makeArgs({hop_hints: [{chan_id: undefined}]}),
    description: 'Route hop channel id is required in hop hint',
    error: 'ExpectedRouteHopChannelIdInRouteHint',
  },
  {
    args: makeArgs({hop_hints: [makeHopHint({cltv_expiry_delta: undefined})]}),
    description: 'Route hop cltv delta is required in hop hint',
    error: 'ExpectedRouteHopCltvExpiryDeltaInRouteHint',
  },
  {
    args: makeArgs({hop_hints: [makeHopHint({fee_base_msat: undefined})]}),
    description: 'Route hop base fee is required in hop hint',
    error: 'ExpectedRouteHopBaseFeeInRouteHint',
  },
  {
    args: makeArgs({
      hop_hints: [makeHopHint({fee_proportional_millionths: undefined})],
    }),
    description: 'Route hop fee rate is required in hop hint',
    error: 'ExpectedRouteHopFeeRateInRouteHint',
  },
  {
    args: makeArgs({hop_hints: [makeHopHint({node_id: undefined})]}),
    description: 'Route hop node id is required in hop hint',
    error: 'ExpectedRouteHopPublicKeyInRouteHint',
  },
  {
    args: makeArgs({}),
    description: 'Route mapped from route hints',
    expected: {
      route: [
        {
          public_key: 'id',
        },
        {
          base_fee_mtokens: '1',
          channel: '0x0x1',
          cltv_delta: 1,
          fee_rate: '1',
          public_key: 'destination',
        },
      ],
    },
  },
  {
    args: makeArgs({
      hop_hints: [
        {
          chan_id: '1',
          cltv_expiry_delta: 1,
          fee_base_msat: '1',
          fee_proportional_millionths: '1',
          node_id: 'id1',
        },
        {
          chan_id: '2',
          cltv_expiry_delta: 2,
          fee_base_msat: '2',
          fee_proportional_millionths: '2',
          node_id: 'id2',
        },
      ],
    }),
    description: 'Route hops mapped from multiple hints',
    expected: {
      route: [
        {
          public_key: 'id1',
        },
        {
          base_fee_mtokens: '1',
          channel: '0x0x1',
          cltv_delta: 1,
          fee_rate: '1',
          public_key: 'id2',
        },
        {
          base_fee_mtokens: '2',
          channel: '0x0x2',
          cltv_delta: 2,
          fee_rate: '2',
          public_key: 'destination',
        },
      ],
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, ({end, strictSame, throws}) => {
    if (!!error) {
      throws(() => routeFromHint(args), new Error(error), 'Got error');
    } else {
      strictSame(routeFromHint(args), expected.route, 'Got expected route');
    }

    return end();
  });
});
