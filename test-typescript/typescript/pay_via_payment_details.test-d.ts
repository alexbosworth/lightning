import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {
  payViaPaymentDetails,
  PayViaPaymentDetailsResult,
} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const args = {
  cltv_delta: 1,
  destination: Buffer.alloc(33).toString('hex'),
  features: [{bit: 1}],
  id: Buffer.alloc(32).toString('hex'),
  incoming_peer: Buffer.alloc(33).toString('hex'),
  max_fee: 1,
  max_fee_mtokens: '1000',
  messages: [
    {
      type: '1',
      value: Buffer.alloc(1).toString('hex'),
    },
  ],
  mtokens: '1000',
  outgoing_channel: '0x0x1',
  outgoing_channels: ['0x0x1', '0x0x2'],
  pathfinding_timeout: 1,
  routes: [
    [
      {
        base_fee_mtokens: '1000',
        channel: '0x0x1',
        cltv_delta: 1,
        fee_rate: 1,
        public_key: Buffer.alloc(33).toString('hex'),
      },
    ],
  ],
  tokens: 1,
};
const {destination, routes} = args;

// @ts-expect-error
payViaPaymentDetails();
// @ts-expect-error
payViaPaymentDetails({});
// @ts-expect-error
payViaPaymentDetails({destination});
// @ts-expect-error
payViaPaymentDetails({destination, routes});
// @ts-expect-error
payViaPaymentDetails({routes});
// @ts-expect-error
payViaPaymentDetails({lnd});
// @ts-expect-error
payViaPaymentDetails({lnd, routes});
// @ts-expect-error
payViaPaymentDetails({lnd, destination, outgoing_channels: '0x0x1'});

expectType<PayViaPaymentDetailsResult>()(
  await payViaPaymentDetails({
    lnd,
    destination,
    routes,
  })
);
expectType<PayViaPaymentDetailsResult>()(
  await payViaPaymentDetails({
    lnd,
    ...args,
  })
);

expectType<void>()(
  payViaPaymentDetails({lnd, destination, routes}, (error, result) => {
    expectType<PayViaPaymentDetailsResult>()(result);
  })
);
expectType<void>()(
  payViaPaymentDetails({lnd, ...args}, (error, result) => {
    expectType<PayViaPaymentDetailsResult>()(result);
  })
);
