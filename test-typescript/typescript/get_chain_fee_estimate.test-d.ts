import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {
  getChainFeeEstimate,
  GetChainFeeEstimateResult,
} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

const send_to = [{address: 'address', tokens: 1}];
const target_confirmations = 6;

// @ts-expect-error
getChainFeeEstimate();
// @ts-expect-error
getChainFeeEstimate({});
// @ts-expect-error
getChainFeeEstimate({send_to});
// @ts-expect-error
getChainFeeEstimate({lnd});

expectType<GetChainFeeEstimateResult>()(
  await getChainFeeEstimate({lnd, send_to})
);
expectType<GetChainFeeEstimateResult>()(
  await getChainFeeEstimate({lnd, send_to, target_confirmations})
);

expectType<void>()(
  getChainFeeEstimate({lnd, send_to}, (error, result) => {
    expectType<GetChainFeeEstimateResult>()(result);
  })
);
expectType<void>()(
  getChainFeeEstimate({lnd, send_to, target_confirmations}, (error, result) => {
    expectType<GetChainFeeEstimateResult>()(result);
  })
);
