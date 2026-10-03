import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getHeight, GetHeightResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

// @ts-expect-error
getHeight();
// @ts-expect-error
getHeight({});

expectType<GetHeightResult>()(await getHeight({lnd}));

expectType<void>()(
  getHeight({lnd}, (error, result) => {
    expectType<GetHeightResult>()(result);
  })
);
