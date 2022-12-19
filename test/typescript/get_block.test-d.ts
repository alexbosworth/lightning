import {expectError, expectType} from 'tsd';
import {getBlock, GetBlockResult} from '../../lnd_methods';
import {AuthenticatedLnd} from '../../lnd_grpc';

const lnd = {} as AuthenticatedLnd;
const height = 0;
const id = 'id';

expectError(getBlock());
expectError(getBlock({}));
expectError(getBlock({lnd}));
expectError(getBlock({height, id}));

expectType<GetBlockResult>(await getBlock({lnd, height}));
expectType<GetBlockResult>(await getBlock({lnd, id}));

expectType<void>(
  getBlock({lnd, height}, (error, result) => {
    expectType<GetBlockResult>(result);
  })
);
expectType<void>(
  getBlock({lnd, id}, (error, result) => {
    expectType<GetBlockResult>(result);
  })
);
