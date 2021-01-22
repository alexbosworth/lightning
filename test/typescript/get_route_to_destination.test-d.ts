import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {
  getRouteToDestination,
  GetRouteToDestinationResult,
} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const destination = '00';
const messages = [
  {
    type: 'type',
    value: 'value',
  },
];
const payment = '00';
const routes = [
  [
    {
      base_fee_mtokens: '1',
      channel: '0x0x0',
      cltv_delta: 1,
      fee_rate: 1,
      public_key: '00',
    },
  ],
];
const total_mtokens = '1';

expectError(getRouteToDestination());
expectError(getRouteToDestination({}));
expectError(getRouteToDestination({destination}));
expectError(getRouteToDestination({lnd}));

expectType<GetRouteToDestinationResult>(
  await getRouteToDestination({lnd, destination})
);
expectType<GetRouteToDestinationResult>(
  await getRouteToDestination({
    lnd,
    destination,
    messages,
    payment,
    routes,
    total_mtokens,
  })
);

expectType<void>(
  getRouteToDestination({lnd, destination}, (error, result) => {
    expectType<GetRouteToDestinationResult>(result);
  })
);
expectType<void>(
  getRouteToDestination(
    {lnd, destination, messages, payment, routes, total_mtokens},
    (error, result) => {
      expectType<GetRouteToDestinationResult>(result);
    }
  )
);
