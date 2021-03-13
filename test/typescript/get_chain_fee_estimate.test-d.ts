import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {
  getChainFeeEstimate,
  GetChainFeeEstimateResult,
} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

const send_to = [{address: 'address', tokens: 1}];
const target_confirmations = 6;

expectError(getChainFeeEstimate());
expectError(getChainFeeEstimate({}));
expectError(getChainFeeEstimate({send_to}));
expectError(getChainFeeEstimate({lnd}));

expectType<GetChainFeeEstimateResult>(
  await getChainFeeEstimate({lnd, send_to})
);
expectType<GetChainFeeEstimateResult>(
  await getChainFeeEstimate({lnd, send_to, target_confirmations})
);

expectType<void>(
  getChainFeeEstimate({lnd, send_to}, (error, result) => {
    expectType<GetChainFeeEstimateResult>(result);
  })
);
expectType<void>(
  getChainFeeEstimate({lnd, send_to, target_confirmations}, (error, result) => {
    expectType<GetChainFeeEstimateResult>(result);
  })
);
