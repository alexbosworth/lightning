import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getHeight, GetHeightResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

expectError(getHeight());
expectError(getHeight({}));

expectType<GetHeightResult>(await getHeight({lnd}));

expectType<void>(
  getHeight({lnd}, (error, result) => {
    expectType<GetHeightResult>(result);
  })
);
