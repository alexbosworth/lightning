import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getChainAddresses, GetChainAddressesResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

expectError(getChainAddresses());
expectError(getChainAddresses({}));

expectType<GetChainAddressesResult>(await getChainAddresses({lnd}));

expectType<void>(
  getChainAddresses({lnd}, (error, result) => {
    expectType<GetChainAddressesResult>(result);
  }),
);
