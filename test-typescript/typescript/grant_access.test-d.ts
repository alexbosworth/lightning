import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {grantAccess, GrantAccessResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const is_ok_to_create_chain_addresses = true;

// @ts-expect-error
grantAccess();
// @ts-expect-error
grantAccess({});

expectType<GrantAccessResult>()(
  await grantAccess({lnd, is_ok_to_create_chain_addresses})
);

expectType<void>()(
  grantAccess({lnd, is_ok_to_create_chain_addresses}, (error, result) => {
    expectType<GrantAccessResult>()(result);
  })
);
