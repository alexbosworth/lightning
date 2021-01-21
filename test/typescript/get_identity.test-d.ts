import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getIdentity, GetIdentityResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

expectError(getIdentity());
expectError(getIdentity({}));

expectType<GetIdentityResult>(await getIdentity({lnd}));

expectType<void>(
  getIdentity({lnd}, (error, result) => {
    expectType<GetIdentityResult>(result);
  })
);
