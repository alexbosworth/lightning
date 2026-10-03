import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {updateChainTransaction} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

const id = Buffer.alloc(32).toString('hex');
const description = 'description';
const args = {lnd, id, description};

// @ts-expect-error
updateChainTransaction();
// @ts-expect-error
updateChainTransaction({});
// @ts-expect-error
updateChainTransaction({lnd});
// @ts-expect-error
updateChainTransaction({lnd, id});
// @ts-expect-error
updateChainTransaction({lnd, description});

expectType<void>()(await updateChainTransaction(args));

expectType<void>()(updateChainTransaction(args, (error) => {}));
