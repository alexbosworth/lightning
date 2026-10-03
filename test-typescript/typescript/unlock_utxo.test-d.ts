import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {unlockUtxo} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

const id = Buffer.alloc(32).toString('hex');
const transaction_id = id;
const transaction_vout = 0;

const args = {lnd, id, transaction_id, transaction_vout};

// @ts-expect-error
unlockUtxo();
// @ts-expect-error
unlockUtxo({});
// @ts-expect-error
unlockUtxo({lnd});

expectType<void>()(await unlockUtxo(args));

expectType<void>()(unlockUtxo(args, (error) => {}));
