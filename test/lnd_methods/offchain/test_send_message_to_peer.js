const {test} = require('@alexbosworth/tap');

const {sendMessageToPeer} = require('./../../../lnd_methods');

const makeLnd = ({err}) => {
  return {default: {sendCustomMessage: ({}, cbk) => cbk(err)}};
};

const makeArgs = override => {
  const args = {
    lnd: makeLnd({}),
    message: Buffer.from('message').toString('hex'),
    public_key: Buffer.alloc(33, 3).toString('hex'),
    type: 40000,
  };

  Object.keys(override || {}).forEach(key => args[key] = override[key]);

  return args;
};

const tests = [
  {
    args: makeArgs({lnd: undefined}),
    description: 'LND is required',
    error: [400, 'ExpectedAuthenticatedLndToSendMessageToPeer'],
  },
  {
    args: makeArgs({message: undefined}),
    description: 'A message is required',
    error: [400, 'ExpectedCustomMessageDataToSendToPeer'],
  },
  {
    args: makeArgs({public_key: undefined}),
    description: 'A public key is required',
    error: [400, 'ExpectedPeerPublicKeyToSendMessageTo'],
  },
  {
    args: makeArgs({lnd: makeLnd({err: {details: 'unknown service'}})}),
    description: 'Unimplemented error is returned',
    error: [501, 'SendMessageToPeerMethodNotSupported'],
  },
  {
    args: makeArgs({lnd: makeLnd({err: 'err'})}),
    description: 'Server error is returned',
    error: [503, 'UnexpectedErrorSendingMessageToPeer', {err: 'err'}],
  },
  {
    args: makeArgs({}),
    description: 'Message is sent to peer',
  },
  {
    args: makeArgs({type: undefined}),
    description: 'Message with default type is sent to peer',
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, equal, rejects}) => {
    if (!!error) {
      await rejects(sendMessageToPeer(args), error, 'Got expected error');
    } else {
      await sendMessageToPeer(args);
    }

    return end();
  });
});
