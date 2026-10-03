import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getMethods, GetMethodsResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

// @ts-expect-error
getMethods();
// @ts-expect-error
getMethods({});

expectType<GetMethodsResult>()(await getMethods({lnd}));

expectType<void>()(
  getMethods({lnd}, (error, result) => {
    expectType<GetMethodsResult>()(result);
  })
);
