import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getFeeRates, GetFeeRatesResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

// @ts-expect-error
getFeeRates();
// @ts-expect-error
getFeeRates({});

expectType<GetFeeRatesResult>()(await getFeeRates({lnd}));

expectType<void>()(
  getFeeRates({lnd}, (error, result) => {
    expectType<GetFeeRatesResult>()(result);
  })
);
