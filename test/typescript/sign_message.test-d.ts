import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {signMessage, SignMessageResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const message = 'message';

expectError(signMessage());
expectError(signMessage({}));
expectError(signMessage({message}));
expectError(signMessage({lnd}));

expectType<SignMessageResult>(await signMessage({lnd, message}));

expectType<void>(
  signMessage({lnd, message}, (error, result) => {
    expectType<SignMessageResult>(result);
  })
);
