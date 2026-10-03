import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {signMessage, SignMessageResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const message = 'message';

// @ts-expect-error
signMessage();
// @ts-expect-error
signMessage({});
// @ts-expect-error
signMessage({message});
// @ts-expect-error
signMessage({lnd});

expectType<SignMessageResult>()(await signMessage({lnd, message}));

expectType<void>()(
  signMessage({lnd, message}, (error, result) => {
    expectType<SignMessageResult>()(result);
  })
);
