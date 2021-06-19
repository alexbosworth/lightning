const {test} = require('@alexbosworth/tap');

const {getRouteThroughHops} = require('./../../../');

const makeExpected = overrides => {
  const route = {
    confidence: undefined,
    fee: 0,
    fee_mtokens: '1',
    hops: [{
      channel: '0x0x1',
      channel_capacity: 1,
      fee: 0,
      fee_mtokens: '1',
      forward: 0,
      forward_mtokens: '1',
      public_key: 'b',
      timeout: 1,
    }],
    messages: [],
    mtokens: '1',
    payment: undefined,
    safe_fee: 1,
    safe_tokens: 1,
    timeout: 1,
    tokens: 0,
    total_mtokens: undefined,
  };

  Object.keys(overrides).map(key => expected[key] = overrides[key]);

  return {route};
};

const makeLnd = ({}) => {
  return {
    router: {
      buildRoute: ({}, cbk) => cbk(null, {
        route: {
          hops: [{
            amt_to_forward_msat: '1',
            chan_capacity: '1',
            chan_id: '1',
            expiry: 1,
            fee_msat: '1',
            pub_key: 'b',
          }],
          total_amt: 1,
          total_amt_msat: '1',
          total_fees: '1',
          total_fees_msat: '1',
          total_time_lock: 1,
        },
      }),
    },
  };
};

const tests = [
  {
    args: {},
    description: 'LND is required to build route',
    error: [400, 'ExpectedLndWithRouterToGetRouteThroughHops'],
  },
  {
    args: {lnd: {}},
    description: 'An LND with the router RPC is required to build route',
    error: [400, 'ExpectedLndWithRouterToGetRouteThroughHops'],
  },
  {
    args: {lnd: {router: {}}, mtokens: '1'},
    description: 'Public key hops are required for the route',
    error: [400, 'ExpectedPublicKeysToGetRouteThroughHops'],
  },
  {
    args: {lnd: {router: {}}, mtokens: '1', public_keys: []},
    description: 'Public key hops are required for the route',
    error: [400, 'ExpectedPublicKeyToSentToInRouteThroughHops'],
  },
  {
    args: {lnd: {router: {}}, mtokens: '1', tokens: 1},
    description: 'Specifying both mtokens and tokens is not supported',
    error: [400, 'ExpectedEitherMtokensOrTokensNotBoth'],
  },
  {
    args: {
      lnd: {router: {buildRoute: ({}, cbk) => cbk('err')}},
      mtokens: '1',
      public_keys: ['a'],
    },
    description: 'An unexpected error is returned',
    error: [503, 'UnexpectedErrorGettingRouteForHops', {err: 'err'}],
  },
  {
    args: {
      lnd: {
        router: {
          buildRoute: ({}, cbk) => cbk({
            details: 'unknown service routerrpc.Router',
          }),
        },
      },
      mtokens: '1',
      public_keys: ['a'],
    },
    description: 'An unimplemented error is returned',
    error: [501, 'ExpectedRouterRpcWithGetRouteMethod'],
  },
  {
    args: {
      lnd: {
        router: {
          buildRoute: ({}, cbk) => cbk({
            details: 'no matching outgoing channel available for node xyz',
          }),
        },
      },
      mtokens: '1',
      public_keys: ['a'],
    },
    description: 'A lookup error is returned',
    error: [503, 'CannotFindOutboundChannel'],
  },
  {
    args: {
      lnd: {router: {buildRoute: ({}, cbk) => cbk()}},
      mtokens: '1',
      public_keys: ['a'],
    },
    description: 'A response is required',
    error: [503, 'ExpectedResponseWhenGettingRouteForHops'],
  },
  {
    args: {
      lnd: {router: {buildRoute: ({}, cbk) => cbk(null, {})}},
      mtokens: '1',
      public_keys: ['a'],
    },
    description: 'A route in response is expected',
    error: [503, 'ExpectedRouteWhenGettingRouteForHops'],
  },
  {
    args: {
      lnd: {router: {buildRoute: ({}, cbk) => cbk(null, {route: {}})}},
      mtokens: '1',
      public_keys: ['a'],
    },
    description: 'A valid route response is expected',
    error: [503, 'UnexpectedErrorParsingRouteForHops'],
  },
  {
    args: {lnd: makeLnd({}), mtokens: '1000', public_keys: ['a']},
    description: 'A valid route response is expected',
    expected: makeExpected({}),
  },
  {
    args: {lnd: makeLnd({}), public_keys: ['a'], tokens: 1},
    description: 'A valid route response is expected with tokens',
    expected: makeExpected({}),
  },
  {
    args: {lnd: makeLnd({}), public_keys: ['a']},
    description: 'A valid route response is expected without tokens',
    expected: makeExpected({}),
  },
  {
    args: {
      cltv_delta: 1,
      lnd: {
        router: {
          buildRoute: (args, cbk) => {
            if (args.amt_msat !== '1') {
              return cbk([500, 'ExpectedAmtMsatValue']);
            }

            if (args.final_cltv_delta !== 1) {
              return cbk([500, 'ExpectedFinalCltvDelta']);
            }

            if (args.outgoing_chan_id !== '1099511693313') {
              return cbk([500, 'ExpectedOutgoingChannelIdString']);
            }

            const keys = args.hop_pubkeys.map(n => n.toString('hex')).join('');

            if (keys !== '00') {
              return cbk([500, 'ExpectedHopPubkeys']);
            }

            return cbk(null, {
              route: {
                hops: [{
                  amt_to_forward_msat: '1',
                  chan_capacity: '1',
                  chan_id: '1',
                  expiry: 1,
                  fee_msat: '1',
                  pub_key: 'b',
                }],
                total_amt: 1,
                total_amt_msat: '1',
                total_fees: '1',
                total_fees_msat: '1',
                total_time_lock: 1,
              },
            });
          },
        },
      },
      mtokens: '1',
      outgoing_channel: '1x1x1',
      public_keys: ['00'],
    },
    description: 'A valid route response is expected',
    expected: {
      route: {
        confidence: undefined,
        fee: 0,
        fee_mtokens: '1',
        hops: [{
          channel: '0x0x1',
          channel_capacity: 1,
          fee: 0,
          fee_mtokens: '1',
          forward: 0,
          forward_mtokens: '1',
          public_key: 'b',
          timeout: 1,
        }],
        messages: [],
        mtokens: '1',
        payment: undefined,
        safe_fee: 1,
        safe_tokens: 1,
        timeout: 1,
        tokens: 0,
        total_mtokens: undefined,
      },
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, rejects, strictSame}) => {
    if (!!error) {
      rejects(getRouteThroughHops(args), error, 'Got expected error');
    } else {
      const {route} = await getRouteThroughHops(args);

      strictSame(route, expected.route, 'Route');
    }

    return end();
  });
});
