const {test} = require('@alexbosworth/tap');

const {rpcPeerMessageAsMessage} = require('./../../lnd_responses');

const makeArgs = overrides => {
  const response = {
    data: Buffer.alloc(1),
    peer: Buffer.alloc(33, 3),
    type: 44444,
  };

  Object.keys(overrides || {}).forEach(key => response[key] = overrides[key]);

  return response;
};


const makeExpected = overrides => {
  const expected = {
    message: '00',
    public_key: '030303030303030303030303030303030303030303030303030303030303030303',
    type: 44444,
  };

  Object.keys(overrides || {}).forEach(key => expected[key] = overrides[key]);

  return expected;
};

const tests = [
  {
    description: 'RPC peer message is expected',
    error: 'ExpectedRpcMessageToDerivePeerMessage',
  },
  {
    args: makeArgs({data: undefined}),
    description: 'data is expected',
    error: 'ExpectedPeerMessageDataToDerivePeerMessage',
  },
  {
    args: makeArgs({peer: undefined}),
    description: 'peer public key is expected',
    error: 'ExpectedPeerPublicKeyBytesToDerivePeerMessage',
  },
  {
    args: makeArgs({type: undefined}),
    description: 'type is expected',
    error: 'ExpectedCustomMessageTypeNumberToDeriveMessage',
  },
  {
    args: makeArgs({}),
    description: 'RPC peer message is mapped to message',
    expected: makeExpected({}),
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, ({end, strictSame, throws}) => {
    if (!!error) {
      throws(() => rpcPeerMessageAsMessage(args), new Error(error), 'Got err');
    } else {
      strictSame(rpcPeerMessageAsMessage(args), expected, 'Mapped to message');
    }

    return end();
  });
});
