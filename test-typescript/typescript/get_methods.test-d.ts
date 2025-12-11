import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getMethods, GetMethodsResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

expectError(getMethods());
expectError(getMethods({}));

expectType<GetMethodsResult>(await getMethods({lnd}));

expectType<void>(
  getMethods({lnd}, (error, result) => {
    expectType<GetMethodsResult>(result);
  })
);
