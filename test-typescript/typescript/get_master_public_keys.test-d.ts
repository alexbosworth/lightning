import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {
  getMasterPublicKeys,
  GetMasterPublicKeysResult,
} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

// @ts-expect-error
getMasterPublicKeys();
// @ts-expect-error
getMasterPublicKeys({});

expectType<GetMasterPublicKeysResult>()(await getMasterPublicKeys({lnd}));

expectType<void>()(
  getMasterPublicKeys({lnd}, (error, result) => {
    expectType<GetMasterPublicKeysResult>()(result);
  })
);
