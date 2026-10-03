import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getIdentity, GetIdentityResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

// @ts-expect-error
getIdentity();
// @ts-expect-error
getIdentity({});

expectType<GetIdentityResult>()(await getIdentity({lnd}));

expectType<void>()(
  getIdentity({lnd}, (error, result) => {
    expectType<GetIdentityResult>()(result);
  })
);
