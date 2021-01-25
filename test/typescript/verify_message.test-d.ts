import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {verifyMessage, VerifyMessageResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const message = 'message';
const signature = 'signature';

expectError(verifyMessage());
expectError(verifyMessage({}));
expectError(verifyMessage({message}));
expectError(verifyMessage({message, signature}));
expectError(verifyMessage({message, lnd}));
expectError(verifyMessage({signature}));
expectError(verifyMessage({signature, lnd}));
expectError(verifyMessage({lnd}));

expectType<VerifyMessageResult>(await verifyMessage({lnd, message, signature}));

expectType<void>(
  verifyMessage({lnd, message, signature}, (error, result) => {
    expectType<VerifyMessageResult>(result);
  })
);
