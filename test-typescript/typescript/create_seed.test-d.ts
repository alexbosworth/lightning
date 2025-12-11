import {expectError, expectType} from 'tsd';
import {UnauthenticatedLnd} from '../../lnd_grpc';
import {createSeed, CreateSeedResult} from '../../lnd_methods';

const lnd = {} as UnauthenticatedLnd;

const passphrase = 'passphrase';

expectError(createSeed());
expectError(createSeed({}));
expectError(createSeed({passphrase}));

expectType<CreateSeedResult>(await createSeed({lnd}));
expectType<CreateSeedResult>(await createSeed({lnd, passphrase}));

expectType<void>(createSeed({lnd}, () => {}));
expectType<void>(createSeed({lnd, passphrase}, () => {}));
