const {test} = require('@alexbosworth/tap');

const {payViaRoutes} = require('./../../../');

const preimage = Buffer.alloc(32);

const deletePayment = ({}, cbk) => cbk();

const getInfo = ({}, cbk) => {
  return cbk(null, {
    alias: '',
    best_header_timestamp: Math.round(Date.now() / 1000),
    block_hash: Buffer.alloc(32).toString('hex'),
    block_height: 100,
    chains: [],
    color: '#000000',
    features: {},
    identity_pubkey: Buffer.alloc(33).toString('hex'),
    num_active_channels: 1,
    num_peers: 1,
    num_pending_channels: 1,
    synced_to_chain: true,
    uris: [],
    version: 'version',
  });
};

const tests = [
  {
    args: {id: 'id'},
    description: 'A hex ID is expected',
    error: [400, 'ExpectedStandardHexPaymentHashId'],
  },
  {
    args: {},
    description: 'LND is expected',
    error: [400, 'ExpectedLndForToPayViaSpecifiedRoutes'],
  },
  {
    args: {
      lnd: {
        default: {deletePayment, getInfo},
        router: {sendToRouteV2: ({}, cbk) => cbk(null, {})},
      },
    },
    description: 'An array of routes is expected',
    error: [400, 'ExpectedArrayOfRoutesToPayViaRoutes'],
  },
  {
    args: {
      lnd: {
        default: {deletePayment, getInfo},
        router: {sendToRouteV2: ({}, cbk) => cbk(null, {})},
      },
      routes: [],
    },
    description: 'A non-empty array of routes is expected',
    error: [400, 'ExpectedArrayOfRoutesToPayViaRoutes'],
  },
  {
    args: {
      lnd: {
        default: {deletePayment, getInfo},
        router: {sendToRouteV2: ({}, cbk) => cbk(null, {})},
      },
      routes: [null],
    },
    description: 'An array of non-empty routes is expected',
    error: [400, 'ExpectedArrayOfRoutesToAttemptPayingOver'],
  },
  {
    args: {
      lnd: {
        default: {deletePayment, getInfo},
        router: {sendToRouteV2: ({}, cbk) => cbk(null, {})},
      },
      routes: [{}],
    },
    description: 'Routes are expected to have hops',
    error: [400, 'ExpectedArrayOfHopsForPayViaRoute'],
  },
  {
    args: {
      lnd: {
        default: {deletePayment, getInfo},
        router: {sendToRouteV2: ({}, cbk) => cbk(null, {})},
      },
      routes: [{
        fee: 1,
        fee_mtokens: '1000',
        hops: [{
          channel: '1x1x1',
          channel_capacity: 1,
          fee: 1,
          fee_mtokens: '1000',
          forward: 1,
          forward_mtokens: '1000',
          public_key: Buffer.alloc(33).toString('hex'),
          timeout: 100,
        }],
        mtokens: '1000',
        timeout: 100,
        tokens: 1,
      }],
    },
    description: 'A discrete resolution is expected',
    error: [503, 'FailedToReceiveDiscreteFailureOrSuccess'],
  },
  {
    args: {
      lnd: {
        default: {deletePayment, getInfo},
        router: {sendToRouteV2: ({}, cbk) => cbk('err')},
      },
      routes: [{
        fee: 1,
        fee_mtokens: '1000',
        hops: [{
          channel: '1x1x1',
          channel_capacity: 1,
          fee: 1,
          fee_mtokens: '1000',
          forward: 1,
          forward_mtokens: '1000',
          public_key: Buffer.alloc(33).toString('hex'),
          timeout: 100,
        }],
        mtokens: '1000',
        timeout: 100,
        tokens: 1,
      }],
    },
    description: 'Errors are passed back',
    error: [
      503,
      'UnexpectedErrorWhenPayingViaRoute',
      {failures: [[503, 'UnexpectedErrorWhenPayingViaRoute', {err: 'err'}]]},
    ],
  },
  {
    args: {
      lnd: {
        default: {deletePayment, getInfo},
        router: {sendToRouteV2: ({}, cbk) => cbk(null, {})},
      },
      routes: [{
        fee: 1,
        fee_mtokens: '1000',
        hops: [{
          channel: '1x1x1',
          channel_capacity: 1,
          fee: 1,
          fee_mtokens: '1000',
          forward: 1,
          forward_mtokens: '1000',
          timeout: 100,
        }],
        mtokens: '1000',
        timeout: 100,
        tokens: 1,
      }],
    },
    description: 'Public keys in hops are expected',
    error: [400, 'ExpectedPublicKeyInPayViaRouteHops'],
  },
  {
    args: {
      lnd: {
        default: {deletePayment, getInfo},
        router: {sendToRouteV2: ({}, cbk) => cbk(null, {})},
      },
      routes: [{
        fee: 1,
        fee_mtokens: '1000',
        hops: [...Array(21)].map(() => ({
          channel: '1x1x1',
          channel_capacity: 1,
          fee: 1,
          fee_mtokens: '1000',
          forward: 1,
          forward_mtokens: '1000',
          public_key: Buffer.alloc(33).toString('hex'),
          timeout: 100,
        })),
        mtokens: '1000',
        timeout: 100,
        tokens: 1,
      }],
    },
    description: 'A route with fewer than max hops is expected',
    error: [400, 'ExpectedRouteWithFewerThanMaxHops'],
  },
  {
    args: {
      lnd: {
        default: {deletePayment, getInfo},
        router: {
          sendToRouteV2: ({}, cbk) => {
            return cbk(null, {
              failure: {
                code: 'UNKNOWN_PAYMENT_HASH',
                failure_source_index: 1,
              },
            });
          },
        },
      },
      routes: [{
        fee: 1,
        fee_mtokens: '1000',
        hops: [{
          channel: '1x1x1',
          channel_capacity: 1,
          fee: 1,
          fee_mtokens: '1000',
          forward: 1,
          forward_mtokens: '1000',
          public_key: Buffer.alloc(33).toString('hex'),
          timeout: 100,
        }],
        mtokens: '1000',
        timeout: 100,
        tokens: 1,
      }],
    },
    description: 'Get error paying via routes',
    error: [
      404,
      'UnknownPaymentHash',
      {
        failures: [[
          404,
          'UnknownPaymentHash',
          {
            channel: undefined,
            height: undefined,
            index: 1,
            mtokens: undefined,
            policy: null,
            timeout_height: undefined,
            update: undefined,
          },
        ]],
      },
    ],
  },
  {
    args: {
      lnd: {
        default: {deletePayment, getInfo},
        router: {
          sendToRouteV2: ({}, cbk) => {
            return cbk(null, {
              failure: {
                channel_update: {
                  base_fee: 1000,
                  chain_hash: Buffer.alloc(32),
                  chan_id: '7654321',
                  channel_flags: 0,
                  extra_opaque_data: Buffer.alloc(0),
                  fee_rate: 1,
                  htlc_maximum_msat: 10000,
                  htlc_minimum_msat: 1000,
                  message_flags: 1,
                  signature: Buffer.alloc(64),
                  time_lock_delta: 40,
                  timestamp: 1231006505,
                },
                code: 'FEE_INSUFFICIENT',
                failure_source_index: 1,
                htlc_msat: '1',
              },
            });
          },
        },
      },
      routes: [{
        fee: 1,
        fee_mtokens: '1000',
        hops: [
          {
            channel: '1x1x1',
            channel_capacity: 1,
            fee: 1,
            fee_mtokens: '1000',
            forward: 1,
            forward_mtokens: '1000',
            public_key: '00',
            timeout: 100,
          },
          {
            channel: '0x116x52145',
            channel_capacity: 1,
            fee: 1,
            fee_mtokens: '1000',
            forward: 1,
            forward_mtokens: '1000',
            public_key: '01',
            timeout: 100,
          },
        ],
        mtokens: '1000',
        timeout: 100,
        tokens: 1,
      }],
    },
    description: 'Get error paying via routes',
    error: [
      503,
      'FeeInsufficient',
      {
        failures: [[
          503,
          'FeeInsufficient',
          {
            channel: '0x116x52145',
            height: undefined,
            index: 1,
            mtokens: '1',
            policy: {
              base_fee_mtokens: '1000',
              cltv_delta: 40,
              fee_rate: 1,
              is_disabled: false,
              max_htlc_mtokens: 10000,
              min_htlc_mtokens: 1000,
              public_key: '00',
              updated_at: '2009-01-03T18:15:05.000Z',
            },
            timeout_height: undefined,
            update: {
              chain: '0000000000000000000000000000000000000000000000000000000000000000',
              channel_flags: 0,
              extra_opaque_data: '',
              message_flags: 1,
              signature: '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
            },
          },
        ]],
      },
    ],
  },
  {
    args: {
      lnd: {
        default: {deletePayment, getInfo},
        router: {sendToRouteV2: ({}, cbk) => cbk(null, {preimage})},
      },
      routes: [{
        fee: 1,
        fee_mtokens: '1000',
        hops: [{
          channel: '1x1x1',
          channel_capacity: 1,
          fee: 1,
          fee_mtokens: '1000',
          forward: 1,
          forward_mtokens: '1000',
          public_key: '01',
          timeout: 100,
        }],
        mtokens: '1000',
        timeout: 100,
        tokens: 1,
      }],
    },
    description: 'Pay via routes',
    expected: {
      failures: [],
      fee: 1,
      fee_mtokens: '1000',
      hops: [{
        channel: '1x1x1',
        channel_capacity: 1,
        fee: 1,
        fee_mtokens: '1000',
        forward: 1,
        forward_mtokens: '1000',
        timeout: 100,
      }],
      mtokens: '1000',
      secret: preimage.toString('hex'),
      tokens: 1,
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, equal, strictSame}) => {
    if (!!error) {
      try {
        await payViaRoutes(args);
      } catch (gotErr) {
        if (gotErr.length === 2) {
          strictSame(gotErr, error, 'Got expected error')
        } else {
          const [errCode, errMessage, {failures}] = gotErr;
          const [expectedCode, expectedMessage, expectedDetails] = error;

          equal(errCode, expectedCode, 'Error code received');
          equal(errMessage, expectedMessage, 'Error message received');

          strictSame(failures, expectedDetails.failures, 'Full fails received');
        }

        return end();
      }
    }

    const paid = await payViaRoutes(args);

    strictSame(paid.failures, expected.failures, 'Failures are returned');
    equal(paid.fee, expected.fee, 'Fee is returned');
    equal(paid.fee_mtokens, expected.fee_mtokens, 'Fee mtokens are returned');
    strictSame(paid.hops, expected.hops, 'Hops are returned');
    equal(paid.id.length, preimage.toString('hex').length, 'Got payment hash');
    equal(paid.is_confirmed, true, 'Payment is confirmed');
    equal(paid.is_outgoing, true, 'Transaction is an outgoing one');
    equal(paid.mtokens, expected.mtokens, 'Mtokens are returned');
    equal(paid.secret, expected.secret, 'Payment results in secret delivery');
    equal(paid.tokens, expected.tokens, 'Tokens are returned');

    return end();
  });
});
