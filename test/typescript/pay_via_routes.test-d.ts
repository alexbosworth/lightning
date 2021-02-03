import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {payViaRoutes, PayViaRoutesResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const routes = [
  {
    fee: 1,
    fee_mtokens: '1000',
    hops: [
      {
        channel: '1x1x1',
        channel_capacity: 1,
        fee: 1,
        fee_mtokens: '1000',
        forward: 1,
        forward_mtokens: '1000',
        public_key: Buffer.alloc(33).toString('hex'),
        timeout: 100,
      },
    ],
    mtokens: '1000',
    timeout: 100,
    tokens: 1,
  },
];

expectError(payViaRoutes());
expectError(payViaRoutes({}));
expectError(payViaRoutes({routes}));
expectError(payViaRoutes({lnd}));

expectType<PayViaRoutesResult>(await payViaRoutes({lnd, routes}));

expectType<void>(
  payViaRoutes({lnd, routes}, (error, result) => {
    expectType<PayViaRoutesResult>(result);
  })
);
