const {test} = require('@alexbosworth/tap');

const {disconnectWatchtower} = require('./../../../lnd_methods');

const makeLnd = err => {
  return {tower_client: {removeTower: ({}, cbk) => cbk(err)}};
};

const makeArgs = override => {
  const args = {
    lnd: makeLnd(),
    public_key: Buffer.alloc(33, 3).toString('hex'),
  };

  Object.keys(override || {}).forEach(key => args[key] = override[key]);

  return args;
};

const tests = [
  {
    args: makeArgs({lnd: undefined}),
    description: 'LND is required',
    error: [400, 'ExpectedLndToDisconnectWatchtower'],
  },
  {
    args: makeArgs({public_key: undefined}),
    description: 'A public key is required',
    error: [400, 'ExpectedPublicKeyOfWatchtowerToDisconnect'],
  },
  {
    args: makeArgs({
      lnd: makeLnd({
        message: '12 UNIMPLEMENTED: unknown service wtclientrpc.WatchtowerClient',
      }),
    }),
    description: 'Unimplemented error is returned',
    error: [501, 'ExpectedLndWithWtclientrpcTagToDisconnect'],
  },
  {
    args: makeArgs({lnd: makeLnd('err')}),
    description: 'Server error is returned',
    error: [503, 'UnexpectedErrDisconnectingWatchtower', {err: 'err'}],
  },
  {
    args: makeArgs({}),
    description: 'A tower is added',
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, equal, rejects}) => {
    if (!!error) {
      await rejects(disconnectWatchtower(args), error, 'Got expected error');
    } else {
      await disconnectWatchtower(args);
    }

    return end();
  });
});
