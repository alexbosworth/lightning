import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {sendMessageToPeer} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const message = 'msg';
const public_key = 'pubkey';
const type = 2;

// @ts-expect-error
sendMessageToPeer();
// @ts-expect-error
sendMessageToPeer({});
// @ts-expect-error
sendMessageToPeer({lnd});
// @ts-expect-error
sendMessageToPeer({lnd, message});
// @ts-expect-error
sendMessageToPeer({lnd, public_key});

expectType<void>()(await sendMessageToPeer({lnd, message, public_key}));
expectType<void>()(await sendMessageToPeer({lnd, message, public_key, type}));

expectType<void>()(
  sendMessageToPeer({lnd, message, public_key}, (error, result) => {})
);
expectType<void>()(
  sendMessageToPeer({lnd, message, public_key, type}, (error, result) => {})
);
