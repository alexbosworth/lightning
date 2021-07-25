import {expectError, expectType} from 'tsd';
import {UnauthenticatedLnd} from '../../lnd_grpc';
import {createWallet} from '../../lnd_methods';

const lnd = {} as UnauthenticatedLnd;

const passphrase = 'passphrase';
const password = 'password';
const seed = 'seed';

expectError(createWallet());
expectError(createWallet({}));
expectError(createWallet({lnd}));
expectError(createWallet({passphrase}));
expectError(createWallet({password}));
expectError(createWallet({seed}));
expectError(createWallet({lnd, passphrase}));
expectError(createWallet({lnd, password}));
expectError(createWallet({lnd, seed}));
expectError(createWallet({lnd, passphrase, password}));
expectError(createWallet({lnd, passphrase, seed}));

expectType<void>(await createWallet({lnd, password, seed}));
expectType<void>(await createWallet({lnd, passphrase, password, seed}));

expectType<void>(createWallet({lnd, password, seed}, () => {}));
expectType<void>(createWallet({lnd, passphrase, password, seed}, () => {}));
