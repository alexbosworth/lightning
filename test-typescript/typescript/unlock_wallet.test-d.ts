import {expectError, expectType} from 'tsd';
import {UnauthenticatedLnd} from '../../lnd_grpc';
import {unlockWallet} from '../../lnd_methods';

const lnd = {} as UnauthenticatedLnd;

const password = 'password';

expectError(unlockWallet());
expectError(unlockWallet({}));
expectError(unlockWallet({lnd}));
expectError(unlockWallet({password}));

expectType<void>(await unlockWallet({lnd, password}));

expectType<void>(unlockWallet({lnd, password}, () => {}));
