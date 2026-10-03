import {expectType} from '../expect';
import {UnauthenticatedLnd} from '../../lnd_grpc';
import {createWallet, CreateWalletResult} from '../../lnd_methods';

const lnd = {} as UnauthenticatedLnd;

const passphrase = 'passphrase';
const password = 'password';
const seed = 'seed';

// @ts-expect-error
createWallet();
// @ts-expect-error
createWallet({});
// @ts-expect-error
createWallet({lnd});
// @ts-expect-error
createWallet({passphrase});
// @ts-expect-error
createWallet({password});
// @ts-expect-error
createWallet({seed});
// @ts-expect-error
createWallet({lnd, passphrase});
// @ts-expect-error
createWallet({lnd, password});
// @ts-expect-error
createWallet({lnd, seed});
// @ts-expect-error
createWallet({lnd, passphrase, password});
// @ts-expect-error
createWallet({lnd, passphrase, seed});

expectType<CreateWalletResult>()(await createWallet({lnd, password, seed}));
expectType<CreateWalletResult>()(
  await createWallet({lnd, passphrase, password, seed})
);

createWallet({lnd, password, seed}, (err, res) => {
  expectType<CreateWalletResult>()(res);
});
createWallet({lnd, passphrase, password, seed}, (err, res) => {
  expectType<CreateWalletResult>()(res);
});
