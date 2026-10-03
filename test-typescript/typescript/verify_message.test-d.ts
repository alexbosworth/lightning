import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {verifyMessage, VerifyMessageResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const message = 'message';
const signature = 'signature';

// @ts-expect-error
verifyMessage();
// @ts-expect-error
verifyMessage({});
// @ts-expect-error
verifyMessage({message});
// @ts-expect-error
verifyMessage({message, signature});
// @ts-expect-error
verifyMessage({message, lnd});
// @ts-expect-error
verifyMessage({signature});
// @ts-expect-error
verifyMessage({signature, lnd});
// @ts-expect-error
verifyMessage({lnd});

expectType<VerifyMessageResult>()(await verifyMessage({lnd, message, signature}));

expectType<void>()(
  verifyMessage({lnd, message, signature}, (error, result) => {
    expectType<VerifyMessageResult>()(result);
  })
);
