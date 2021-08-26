const EventEmitter = require('events');
const {test} = require('@alexbosworth/tap');

const {getInfoResponse} = require('./../fixtures');
const {pay} = require('./../../../');

const getInfo = ({}, cbk) => cbk(null, getInfoResponse);
const preimage = Buffer.alloc(32);

const makePaymentData = overrides => {
  const data = {
    creation_date: '1',
    creation_time_ns: '0',
    failure_reason: 'FAILURE_REASON_TIMEOUT',
    fee_msat: '1000',
    fee_sat: '1',
    htlcs: [{
      attempt_time_ns: '1000000',
      failure: {
        channel_update: {
          base_fee: '1000',
          chain_hash: Buffer.alloc(32),
          chan_id: '1',
          channel_flags: 1,
          extra_opaque_data: Buffer.alloc(1),
          fee_rate: 1,
          htlc_maximum_msat: '1000',
          htlc_minimum_msat: '1000',
          message_flags: 1,
          signature: Buffer.alloc(71),
          time_lock_delta: 1,
          timestamp: 1,
        },
        code: 'UNREADABLE_FAILURE',
        failure_source_index1: 1,
        height: 1,
        htlc_msat: '1000',
      },
      resolve_time_ns: '1000000',
      route: {
        hops: [{
          amt_to_forward_msat: '1000',
          chan_id: '1',
          chan_capacity: 1,
          expiry: 1,
          fee_msat: '1000',
          mpp_record: {
            payment_addr: Buffer.alloc(32),
            total_amt_msat: '1000',
          },
          pub_key: Buffer.alloc(33).toString('hex'),
          tlv_payload: true,
        }],
        total_amt: '1',
        total_amt_msat: '1000',
        total_fees: '1',
        total_fees_msat: '1000',
        total_time_lock: 1,
      },
      status: 'FAILED',
    }],
    path: [Buffer.alloc(33).toString('hex'), Buffer.alloc(33).toString('hex')],
    payment_hash: Buffer.alloc(32).toString('hex'),
    payment_index: '1',
    payment_preimage: Buffer.alloc(32).toString('hex'),
    payment_request: 'lntb1500n1pdn4czkpp5ugdqer05qrrxuchrzkcue94th9w2xzasp9qm7d0yxcgp4uh4kn4qdpa2fjkzep6yprkcmmzv9kzqsmj09c8gmmrw4e8yetwvdujq5n9va6kcct5d9hkucqzysdlghdpua7uvjjkcfj49psxtlqzkp5pdncffdfk2cp3mp76thrl29qhqgzufm503pjj96586n5w6edgw3n66j4rxxs707y4zdjuhyt6qqe5weu4',
    status: 'FAILED',
    value: '1',
    value_msat: '1000',
    value_sat: '1',
  };

  Object.keys(overrides).forEach(k => data[k] = overrides[k]);

  return data;
};

const tests = [
  {
    args: {},
    description: 'LND is expected',
    error: [400, 'ExpectedAuthenticatedLndToMakePayment'],
  },
  {
    args: {lnd: {}, path: 'path', request: 'request'},
    description: 'A request or path is expected',
    error: [400, 'ExpectedEitherPathOrRequestNotBoth'],
  },
  {
    args: {lnd: {}},
    description: 'A request or path is expected',
    error: [400, 'ExpectedEitherPathOrRequest'],
  },
  {
    args: {
      lnd: {
        default: {getInfo},
        router: {
          sendPaymentV2: ({}) => {
            const data = makePaymentData({});
            const emitter = new EventEmitter();

            process.nextTick(() => emitter.emit('data', data));

            return emitter;
          },
        },
      },
      request: 'lntb1500n1pdn4czkpp5ugdqer05qrrxuchrzkcue94th9w2xzasp9qm7d0yxcgp4uh4kn4qdpa2fjkzep6yprkcmmzv9kzqsmj09c8gmmrw4e8yetwvdujq5n9va6kcct5d9hkucqzysdlghdpua7uvjjkcfj49psxtlqzkp5pdncffdfk2cp3mp76thrl29qhqgzufm503pjj96586n5w6edgw3n66j4rxxs707y4zdjuhyt6qqe5weu4',
    },
    description: 'Pay via request',
    error: [503, 'PaymentAttemptsTimedOut'],
  },
  {
    args: {
      lnd: {
        default: {getInfo},
        router: {sendToRouteV2: ({}, cbk) => cbk(null, {preimage})},
      },
      path: {
        id: Buffer.alloc(32).toString('hex'),
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
    },
    description: 'Pay via routes',
    expected: {
      failures: undefined,
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
        await pay(args);
      } catch (gotErr) {
        if (gotErr.length === 2) {
          strictSame(gotErr, error, 'Got expected error')
        } else {
          const [errCode, errMessage] = gotErr;
          const [expectedCode, expectedMessage, expectedDetails] = error;

          equal(errCode, expectedCode, 'Error code received');
          equal(errMessage, expectedMessage, 'Error message received');

          strictSame(failures, expectedDetails.failures, 'Full fails received');
        }

        return end();
      }
    }

    const paid = await pay(args);

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
