import {expectType} from '../expect';
import {getBlockHeader, GetBlockHeaderResult} from '../../lnd_methods';
import {AuthenticatedLnd} from '../../lnd_grpc';

const lnd = {} as AuthenticatedLnd;
const height = 0;
const id = 'id';

// @ts-expect-error
getBlockHeader();
// @ts-expect-error
getBlockHeader({});
// @ts-expect-error
getBlockHeader({lnd});
// @ts-expect-error
getBlockHeader({height, id});

expectType<GetBlockHeaderResult>()(await getBlockHeader({lnd, height}));
expectType<GetBlockHeaderResult>()(await getBlockHeader({lnd, id}));

expectType<void>()(
  getBlockHeader({lnd, height}, (error, result) => {
    expectType<GetBlockHeaderResult>()(result);
  })
);
expectType<void>()(
  getBlockHeader({lnd, id}, (error, result) => {
    expectType<GetBlockHeaderResult>()(result);
  })
);
