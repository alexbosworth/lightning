import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getChainFeeRate, GetChainFeeRateResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

const confirmation_target = 6;

expectError(getChainFeeRate());
expectError(getChainFeeRate({}));

expectType<GetChainFeeRateResult>(await getChainFeeRate({lnd}));
expectType<GetChainFeeRateResult>(
  await getChainFeeRate({lnd, confirmation_target})
);

expectType<void>(
  getChainFeeRate({lnd}, (error, result) => {
    expectType<GetChainFeeRateResult>(result);
  })
);
expectType<void>(
  getChainFeeRate({lnd, confirmation_target}, (error, result) => {
    expectType<GetChainFeeRateResult>(result);
  })
);
