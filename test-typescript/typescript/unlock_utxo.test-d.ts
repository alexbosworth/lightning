import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {unlockUtxo} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

const id = Buffer.alloc(32).toString('hex');
const transaction_id = id;
const transaction_vout = 0;

const args = {lnd, id, transaction_id, transaction_vout};

expectError(unlockUtxo());
expectError(unlockUtxo({}));
expectError(unlockUtxo({lnd}));

expectType<void>(await unlockUtxo(args));

expectType<void>(unlockUtxo(args, (error) => {}));
