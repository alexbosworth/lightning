import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {
  verifyChainAddressMessage,
  VerifyChainAddressMessageResult,
} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const address = '';
const message = '';
const signature = '';

// @ts-expect-error
verifyChainAddressMessage({lnd, address});
// @ts-expect-error
verifyChainAddressMessage({lnd, message});
// @ts-expect-error
verifyChainAddressMessage({lnd, address, message});
// @ts-expect-error
verifyChainAddressMessage({lnd, address, signature});
// @ts-expect-error
verifyChainAddressMessage({lnd, message, signature});

expectType<VerifyChainAddressMessageResult>()(
  await verifyChainAddressMessage({
    lnd,
    address,
    message,
    signature,
  }),
);

expectType<void>()(
  verifyChainAddressMessage({lnd, address, message, signature}, (error, result) => {
    expectType<VerifyChainAddressMessageResult>()(result);
  }),
);
