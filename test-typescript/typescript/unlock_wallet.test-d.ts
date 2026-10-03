import {expectType} from '../expect';
import {UnauthenticatedLnd} from '../../lnd_grpc';
import {unlockWallet} from '../../lnd_methods';

const lnd = {} as UnauthenticatedLnd;

const password = 'password';

// @ts-expect-error
unlockWallet();
// @ts-expect-error
unlockWallet({});
// @ts-expect-error
unlockWallet({lnd});
// @ts-expect-error
unlockWallet({password});

expectType<void>()(await unlockWallet({lnd, password}));

expectType<void>()(unlockWallet({lnd, password}, () => {}));
