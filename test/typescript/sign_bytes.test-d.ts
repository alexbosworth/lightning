import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {signBytes, SignBytesResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const key_family = 0;
const key_index = 0;
const preimage = '00';

expectError(signBytes());
expectError(signBytes({}));
expectError(signBytes({key_family}));
expectError(signBytes({key_family, key_index}));
expectError(signBytes({key_family, preimage}));
expectError(signBytes({key_family, key_index, preimage}));
expectError(signBytes({key_index}));
expectError(signBytes({key_index, preimage}));
expectError(signBytes({preimage}));
expectError(signBytes({lnd}));
expectError(signBytes({lnd, key_family}));
expectError(signBytes({lnd, key_index}));
expectError(signBytes({lnd, preimage}));
expectError(signBytes({lnd, key_family, key_index}));
expectError(signBytes({lnd, key_index, preimage}));
expectError(signBytes({lnd, key_family, preimage}));

expectType<SignBytesResult>(
  await signBytes({
    lnd,
    key_family,
    key_index,
    preimage,
  })
);

expectType<void>(
  signBytes({lnd, key_family, key_index, preimage}, (error, result) => {
    expectType<SignBytesResult>(result);
  })
);
