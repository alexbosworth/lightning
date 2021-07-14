const EventEmitter = require('events');

const {test} = require('@alexbosworth/tap');

const {subscribeToForwards} = require('./../../../');

const emitter = new EventEmitter();

const makeForwardResponse = () => {
  return {
    event_type: 'UNKNOWN',
    incoming_channel_id: '1',
    incoming_htlc_id: '0',
    outgoing_channel_id: '2',
    outgoing_htlc_id: '1',
    settle_event: {preimage: Buffer.alloc(0)},
    timestamp_ns: (1e6).toString(),
  };
};

const makeLnd = ({err}) => {
  return {router: {subscribeHtlcEvents: ({}) => emitter}};
};

const tests = [
  {
    args: {},
    description: 'An LND object is required to subscribe to forwards',
    error: 'ExpectedAuthenticatedLndToSubscribeToForwards',
  },
  {
    args: {lnd: makeLnd({})},
    description: 'An LND object is required to subscribe to forwards',
    expected: {
      forward: {
        at: '1970-01-01T00:00:00.001Z',
        cltv_delta: undefined,
        external_failure: undefined,
        fee: undefined,
        fee_mtokens: undefined,
        in_channel: '0x0x1',
        in_payment: 0,
        internal_failure: undefined,
        is_confirmed: true,
        is_failed: false,
        is_receive: false,
        is_send: false,
        mtokens: undefined,
        out_channel: '0x0x2',
        out_payment: 1,
        secret: undefined,
        timeout: undefined,
        tokens: undefined,
      },
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, equal, match, strictSame, throws}) => {
    if (!!error) {
      throws(() => subscribeToForwards(args), new Error(error), 'Got error');
    } else {
      let gotEnd;
      let gotErr;
      let gotErr2 = null;
      let gotForward;
      let gotStatus;
      const sub = subscribeToForwards(args);

      sub.on('end', () => gotEnd = true);
      sub.on('error', err => gotErr = err);
      sub.on('forward', forward => gotForward = forward);
      sub.on('status', status => gotStatus = status);

      emitter.emit('end', {});
      emitter.emit('error', new Error('error'));

      sub.removeAllListeners('error');

      const sub2 = subscribeToForwards(args);

      sub2.on('error', err => gotErr3 = err);
      sub2.on('forward', forward => gotForward = forward);

      emitter.emit('data', {});

      const forwardErr = 'ExpectedHtlcEventTypeToDeriveForwardFromHtlcEvent';

      strictSame(gotErr3, [503, forwardErr], 'Got forward event error');

      emitter.emit('data', makeForwardResponse({}));

      strictSame(gotForward, expected.forward, 'Got expected forward');

      [sub, sub2].forEach(n => n.removeAllListeners());
    }

    return end();
  });
});
