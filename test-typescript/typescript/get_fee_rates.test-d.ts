import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getFeeRates, GetFeeRatesResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

expectError(getFeeRates());
expectError(getFeeRates({}));

expectType<GetFeeRatesResult>(await getFeeRates({lnd}));

expectType<void>(
  getFeeRates({lnd}, (error, result) => {
    expectType<GetFeeRatesResult>(result);
  })
);
