import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {
  getRouteThroughHops,
  GetRouteThroughHopsResult,
} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const public_keys = ['a'];
const tokens = 1;
const mtokens = '1';

expectError(getRouteThroughHops());
expectError(getRouteThroughHops({}));
expectError(getRouteThroughHops({public_keys}));
expectError(getRouteThroughHops({lnd}));
expectError(getRouteThroughHops({lnd, tokens, mtokens})); // Specifying both mtokens and tokens is not supported

expectType<GetRouteThroughHopsResult>(
  await getRouteThroughHops({lnd, public_keys})
);
expectType<GetRouteThroughHopsResult>(
  await getRouteThroughHops({lnd, public_keys, tokens})
);
expectType<GetRouteThroughHopsResult>(
  await getRouteThroughHops({lnd, public_keys, mtokens})
);

expectType<void>(
  getRouteThroughHops({lnd, public_keys}, (error, result) => {
    expectType<GetRouteThroughHopsResult>(result);
  })
);
expectType<void>(
  getRouteThroughHops({lnd, public_keys, tokens}, (error, result) => {
    expectType<GetRouteThroughHopsResult>(result);
  })
);
expectType<void>(
  getRouteThroughHops({lnd, public_keys, mtokens}, (error, result) => {
    expectType<GetRouteThroughHopsResult>(result);
  })
);
