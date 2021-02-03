import {expectError, expectType} from 'tsd';
import {
  confirmedFromPayment,
  ConfirmedFromPaymentArgs,
  ConfirmedFromPaymentResult,
} from '../../lnd_responses/confirmed_from_payment';

const payment: ConfirmedFromPaymentArgs = {
  creation_date: '1',
  creation_time_ns: '1',
  failure_reason: 'FAILURE_REASON_NONE',
  fee_msat: '1000',
  fee_sat: '1',
  htlcs: [
    {
      attempt_time_ns: '1',
      status: 'SUCCEEDED',
      resolve_time_ns: '1',
      route: {
        hops: [
          {
            amt_to_forward: '1',
            amt_to_forward_msat: '1000',
            chan_capacity: '1',
            chan_id: '1',
            custom_records: {'1': Buffer.alloc(1)},
            expiry: 1,
            fee: '1',
            fee_msat: '1000',
            mpp_record: {
              payment_addr: Buffer.alloc(32),
              total_amt_msat: '1000',
            },
            pub_key: Buffer.alloc(33).toString('hex'),
            tlv_payload: true,
          },
        ],
        total_amt: '1',
        total_amt_msat: '1000',
        total_time_lock: 1,
        total_fees: '1',
        total_fees_msat: '1000',
      },
    },
  ],
  path: [Buffer.alloc(33).toString('hex')],
  payment_hash: Buffer.alloc(32).toString('hex'),
  payment_index: '1',
  payment_preimage: Buffer.alloc(32).toString('hex'),
  payment_request: '',
  status: 'SUCCEEDED',
  value: '1',
  value_msat: '1000',
  value_sat: '1',
};

expectError(confirmedFromPayment());
expectError(confirmedFromPayment({}));

expectType<ConfirmedFromPaymentResult>(confirmedFromPayment(payment));
