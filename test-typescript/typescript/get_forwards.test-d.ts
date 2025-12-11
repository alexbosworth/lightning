import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getForwards, GetForwardsResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const after = 'after';
const before = 'before';
const limit = 1;
const token = 'token';

expectError(getForwards());
expectError(getForwards({}));
expectError(getForwards({lnd, limit, token}));

expectType<GetForwardsResult>(await getForwards({lnd}));
expectType<GetForwardsResult>(await getForwards({lnd, limit, after, before}));
expectType<GetForwardsResult>(await getForwards({lnd, token}));

expectType<void>(
  getForwards({lnd}, (error, result) => {
    expectType<GetForwardsResult>(result);
  })
);
expectType<void>(
  getForwards({lnd, limit, after, before}, (error, result) => {
    expectType<GetForwardsResult>(result);
  })
);
expectType<void>(
  getForwards({lnd, token}, (error, result) => {
    expectType<GetForwardsResult>(result);
  })
);
