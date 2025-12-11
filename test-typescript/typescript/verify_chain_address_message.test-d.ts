import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {
  verifyChainAddressMessage,
  VerifyChainAddressMessageResult,
} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const address = '';
const message = '';
const signature = '';

expectError(verifyChainAddressMessage({lnd, address}));
expectError(verifyChainAddressMessage({lnd, message}));
expectError(verifyChainAddressMessage({lnd, address, message}));
expectError(verifyChainAddressMessage({lnd, address, signature}));
expectError(verifyChainAddressMessage({lnd, message, signature}));

expectType<VerifyChainAddressMessageResult>(
  await verifyChainAddressMessage({
    lnd,
    address,
    message,
    signature,
  }),
);

expectType<void>(
  verifyChainAddressMessage({lnd, address, message, signature}, (error, result) => {
    expectType<VerifyChainAddressMessageResult>(result);
  }),
);
