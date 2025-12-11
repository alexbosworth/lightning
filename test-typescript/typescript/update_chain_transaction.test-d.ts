import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {updateChainTransaction} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

const id = Buffer.alloc(32).toString('hex');
const description = 'description';
const args = {lnd, id, description};

expectError(updateChainTransaction());
expectError(updateChainTransaction({}));
expectError(updateChainTransaction({lnd}));
expectError(updateChainTransaction({lnd, id}));
expectError(updateChainTransaction({lnd, description}));

expectType<void>(await updateChainTransaction(args));

expectType<void>(updateChainTransaction(args, (error) => {}));
