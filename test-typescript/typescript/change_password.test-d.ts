import {expectType} from '../expect';
import {UnauthenticatedLnd} from '../../lnd_grpc';
import {changePassword} from '../../lnd_methods';

const lnd = {} as UnauthenticatedLnd;

const current_password = '123';
const new_password = '456';

// @ts-expect-error
changePassword();
// @ts-expect-error
changePassword({});
// @ts-expect-error
changePassword({lnd});
// @ts-expect-error
changePassword({current_password});
// @ts-expect-error
changePassword({new_password});
// @ts-expect-error
changePassword({lnd, current_password});
// @ts-expect-error
changePassword({lnd, new_password});

expectType<void>()(await changePassword({current_password, new_password, lnd}));

expectType<void>()(
  changePassword({current_password, new_password, lnd}, () => {})
);
