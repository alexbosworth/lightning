import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {sendMessageToPeer} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const message = 'msg';
const public_key = 'pubkey';
const type = 2;

expectError(sendMessageToPeer());
expectError(sendMessageToPeer({}));
expectError(sendMessageToPeer({lnd}));
expectError(sendMessageToPeer({lnd, message}));
expectError(sendMessageToPeer({lnd, public_key}));

expectType<void>(await sendMessageToPeer({lnd, message, public_key}));
expectType<void>(await sendMessageToPeer({lnd, message, public_key, type}));

expectType<void>(
  sendMessageToPeer({lnd, message, public_key}, (error, result) => {})
);
expectType<void>(
  sendMessageToPeer({lnd, message, public_key, type}, (error, result) => {})
);
