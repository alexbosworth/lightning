import {expectType} from '../expect';
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
const outgoing_channels = ['0x0x1', '0x0x2'];
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

// @ts-expect-error
getRouteToDestination();
// @ts-expect-error
getRouteToDestination({});
// @ts-expect-error
getRouteToDestination({destination});
// @ts-expect-error
getRouteToDestination({lnd});
// @ts-expect-error
getRouteToDestination({lnd, destination, outgoing_channels: '0x0x1'});

expectType<GetRouteToDestinationResult>()(
  await getRouteToDestination({lnd, destination})
);
expectType<GetRouteToDestinationResult>()(
  await getRouteToDestination({
    lnd,
    destination,
    messages,
    outgoing_channels,
    payment,
    routes,
    total_mtokens,
  })
);

expectType<void>()(
  getRouteToDestination({lnd, destination}, (error, result) => {
    expectType<GetRouteToDestinationResult>()(result);
  })
);
expectType<void>()(
  getRouteToDestination(
    {lnd, destination, messages, payment, routes, total_mtokens},
    (error, result) => {
      expectType<GetRouteToDestinationResult>()(result);
    }
  )
);
