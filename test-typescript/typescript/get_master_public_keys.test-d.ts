import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {
  getMasterPublicKeys,
  GetMasterPublicKeysResult,
} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

expectError(getMasterPublicKeys());
expectError(getMasterPublicKeys({}));

expectType<GetMasterPublicKeysResult>(await getMasterPublicKeys({lnd}));

expectType<void>(
  getMasterPublicKeys({lnd}, (error, result) => {
    expectType<GetMasterPublicKeysResult>(result);
  })
);
