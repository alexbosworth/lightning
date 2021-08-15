import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {requestChainFeeIncrease} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

const transaction_id = 'txid';
const transaction_vout = 0;

const fee_tokens_per_vbyte = 10;
const target_confirmations = 3;

const args = {lnd, transaction_id, transaction_vout};

expectError(requestChainFeeIncrease());
expectError(requestChainFeeIncrease({lnd}));
expectError(requestChainFeeIncrease({lnd, transaction_id, transaction_vout}));
// ExpectedEitherFeeRateOrTargetNotBothToBumpFee
expectError(
  requestChainFeeIncrease({
    ...args,
    fee_tokens_per_vbyte,
    target_confirmations,
  })
);

expectType<void>(
  await requestChainFeeIncrease({...args, fee_tokens_per_vbyte})
);
expectType<void>(
  await requestChainFeeIncrease({...args, target_confirmations})
);

expectType<void>(
  requestChainFeeIncrease(
    {...args, fee_tokens_per_vbyte},
    (error, result) => {}
  )
);
expectType<void>(
  requestChainFeeIncrease(
    {...args, target_confirmations},
    (error, result) => {}
  )
);
