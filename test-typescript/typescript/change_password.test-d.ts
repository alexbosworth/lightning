import {expectError, expectType} from 'tsd';
import {UnauthenticatedLnd} from '../../lnd_grpc';
import {changePassword} from '../../lnd_methods';

const lnd = {} as UnauthenticatedLnd;

const current_password = '123';
const new_password = '456';

expectError(changePassword());
expectError(changePassword({}));
expectError(changePassword({lnd}));
expectError(changePassword({current_password}));
expectError(changePassword({new_password}));
expectError(changePassword({lnd, current_password}));
expectError(changePassword({lnd, new_password}));

expectType<void>(await changePassword({current_password, new_password, lnd}));

expectType<void>(
  changePassword({current_password, new_password, lnd}, () => {})
);
