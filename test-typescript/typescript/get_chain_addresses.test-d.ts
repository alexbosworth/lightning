import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getChainAddresses, GetChainAddressesResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

// @ts-expect-error
getChainAddresses();
// @ts-expect-error
getChainAddresses({});

expectType<GetChainAddressesResult>()(await getChainAddresses({lnd}));

expectType<void>()(
  getChainAddresses({lnd}, (error, result) => {
    expectType<GetChainAddressesResult>()(result);
  }),
);
