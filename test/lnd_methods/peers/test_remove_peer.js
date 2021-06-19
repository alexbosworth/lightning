const {test} = require('@alexbosworth/tap');

const {removePeer} = require('./../../../');

const tests = [
  {
    args: {},
    description: 'LND is required',
    error: [400, 'ExpectedLndForPeerDisconnection'],
  },
  {
    args: {lnd: {default: {disconnectPeer: ({}, cbk) => cbk('err')}}},
    description: 'A public key is expected',
    error: [400, 'ExpectedPublicKeyOfPeerToRemove'],
  },
  {
    args: {
      lnd: {default: {disconnectPeer: ({}, cbk) => cbk('err')}},
      public_key: Buffer.alloc(33, 3).toString('hex'),
    },
    description: 'Errors are passed back',
    error: [503, 'UnexpectedErrorRemovingPeer', {err: 'err'}],
  },
  {
    args: {
      lnd: {default: {disconnectPeer: ({}, cbk) => cbk()}},
      public_key: Buffer.alloc(33, 3).toString('hex'),
    },
    description: 'A peer is removed',
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, rejects, strictSame}) => {
    if (!!error) {
      await rejects(() => removePeer(args), error, 'Got expected error');
    } else {
      const res = await removePeer(args);

      strictSame(res, expected, 'Got expected result');
    }

    return end();
  });
});
