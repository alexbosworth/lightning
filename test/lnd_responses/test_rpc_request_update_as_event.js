const {test} = require('@alexbosworth/tap');

const method = require('./../../lnd_responses/rpc_request_update_as_event');

const makeArgs = overrides => {
  const args = {
    msg_id: '1',
    request_id: '1',
    raw_macaroon: Buffer.alloc(0),
    custom_caveat_condition: '',
    intercept_type: 'unknown type',
  };

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const makeExpected = overrides => {
  const expected = {call: 1, id: 1, macaroon: undefined};

  Object.keys(overrides).forEach(k => expected[k] = overrides[k]);

  return expected;
};

const tests = [
  {
    args: undefined,
    description: 'Request details expected',
    error: 'ExpectedRpcRequestUpdateDetailsToDeriveUpdateEvent',
  },
  {
    args: makeArgs({custom_caveat_condition: undefined}),
    description: 'A custom caveat is expected',
    error: 'ExpectedCustomCaveatConditionInRpcRequestUpdate',
  },
  {
    args: makeArgs({intercept_type: undefined}),
    description: 'An intercept type is expected',
    error: 'ExpectedInterceptTypeInRpcRequestUpdate',
  },
  {
    args: makeArgs({msg_id: undefined}),
    description: 'A message id is expected',
    error: 'ExpectedMessageIdInRpcRequestUpdate',
  },
  {
    args: makeArgs({raw_macaroon: undefined}),
    description: 'A raw macaroon is expected',
    error: 'ExpectedCompleteMacaroonCredentialsInRequestUpdate',
  },
  {
    args: makeArgs({request_id: undefined}),
    description: 'A request id is expected',
    error: 'ExpectedRequestIdInRpcRequestUpdate',
  },
  {
    args: makeArgs({intercept_type: 'stream_auth'}),
    description: 'Stream auth details are expected',
    error: 'ExpectedStreamAuthDetailsInRpcRequestUpdate',
  },
  {
    args: makeArgs({intercept_type: 'stream_auth', stream_auth: {}}),
    description: 'Stream auth URI is expected',
    error: 'ExpectedFullUriForStreamAuthRpcRequestUpdate',
  },
  {
    args: makeArgs({intercept_type: 'request'}),
    description: 'Request details are expected',
    error: 'ExpectedRequestDetailsInRpcRequestUpdate',
  },
  {
    args: makeArgs({intercept_type: 'request', request: {}}),
    description: 'Request URI is expected',
    error: 'ExpectedFullUriForRequestRpcRequestUpdate',
  },
  {
    args: makeArgs({intercept_type: 'response'}),
    description: 'Response details are expected',
    error: 'ExpectedResponseDetailsInRpcRequestUpdate',
  },
  {
    args: makeArgs({intercept_type: 'response', response: {}}),
    description: 'Response URI is expected',
    error: 'ExpectedFullUriForResponseRpcRequestUpdate',
  },
  {
    args: makeArgs({}),
    description: 'Request mapped to event details',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({raw_macaroon: Buffer.alloc(1)}),
    description: 'Raw macaroon is returned',
    expected: makeExpected({macaroon: 'AA=='}),
  },
  {
    args: makeArgs({
      intercept_type: 'stream_auth',
      stream_auth: {method_full_uri: 'uri'},
    }),
    description: 'Stream request mapped to event details',
    expected: makeExpected({event: 'request', uri: 'uri'}),
  },
  {
    args: makeArgs({
      intercept_type: 'request',
      request: {method_full_uri: 'uri'},
    }),
    description: 'Request mapped to event details',
    expected: makeExpected({event: 'request', uri: 'uri'}),
  },
  {
    args: makeArgs({
      intercept_type: 'response',
      response: {method_full_uri: 'uri'},
    }),
    description: 'Response mapped to event details',
    expected: makeExpected({event: 'response', uri: 'uri'}),
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, ({end, strictSame, throws}) => {
    if (!!error) {
      throws(() => method(args), new Error(error), 'Error');
    } else {
      const res = method(args);

      strictSame(res, expected, 'RPC request update as event');
    }

    return end();
  });
});
