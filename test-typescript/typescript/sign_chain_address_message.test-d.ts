import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {
  signChainAddressMessage,
  SignChainAddressMessageResult,
} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const address = '';
const message = '';

// @ts-expect-error
signChainAddressMessage({lnd, address});
// @ts-expect-error
signChainAddressMessage({lnd, message});

expectType<SignChainAddressMessageResult>()(
  await signChainAddressMessage({
    lnd,
    address,
    message,
  }),
);

expectType<void>()(
  signChainAddressMessage({lnd, address, message}, (error, result) => {
    expectType<SignChainAddressMessageResult>()(result);
  }),
);
