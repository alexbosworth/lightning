import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {
  finishedPayment,
  FinishedPaymentResult,
} from '../../lnd_methods/offchain/finished_payment';

const lnd = {} as AuthenticatedLnd;
const args = {
  confirmed: {
    fee: 1,
    fee_mtokens: '1000',
    hops: [
      {
        channel: '0x0x1',
        channel_capacity: 1,
        fee: 1,
        fee_mtokens: '1000',
        forward_mtokens: '1000',
        public_key: Buffer.alloc(33).toString('hex'),
        timeout: 1,
      },
    ],
    id: Buffer.alloc(32).toString('hex'),
    mtokens: '1000',
    paths: [
      {
        fee_mtokens: '1000',
        hops: [
          {
            channel: '0x0x1',
            channel_capacity: 1,
            fee: 1,
            fee_mtokens: '1000',
            forward_mtokens: '1000',
            public_key: Buffer.alloc(33).toString('hex'),
            timeout: 1,
          },
        ],
        mtokens: '1000',
      },
    ],
    safe_fee: 1,
    safe_tokens: 1,
    secret: Buffer.alloc(32).toString('hex'),
    timeout: 1,
    tokens: 1,
  },
};

expectError(finishedPayment());
expectError(finishedPayment({}));

expectType<FinishedPaymentResult>(await finishedPayment({lnd}));
expectType<FinishedPaymentResult>(await finishedPayment({lnd, ...args}));

expectType<void>(
  finishedPayment({lnd}, (error, result) => {
    expectType<FinishedPaymentResult>(result);
  })
);
expectType<void>(
  finishedPayment({lnd, ...args}, (error, result) => {
    expectType<FinishedPaymentResult>(result);
  })
);
