import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getPublicKey, GetPublicKeyResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const family = 1;
const index = 1;

// @ts-expect-error
getPublicKey();
// @ts-expect-error
getPublicKey({});
// @ts-expect-error
getPublicKey({});
// @ts-expect-error
getPublicKey({lnd, index});

expectType<GetPublicKeyResult>()(await getPublicKey({lnd, family}));
expectType<GetPublicKeyResult>()(await getPublicKey({lnd, family, index}));

expectType<void>()(
  getPublicKey({lnd, family}, (error, result) => {
    expectType<GetPublicKeyResult>()(result);
  })
);
expectType<void>()(
  getPublicKey({lnd, family, index}, (error, result) => {
    expectType<GetPublicKeyResult>()(result);
  })
);
