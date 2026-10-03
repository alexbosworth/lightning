import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {
  isDestinationPayable,
  IsDestinationPayableResult,
} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const destination = 'destination';
const outgoing_channels = ['0x0x1', '0x0x2'];

// @ts-expect-error
isDestinationPayable();
// @ts-expect-error
isDestinationPayable({});
// @ts-expect-error
isDestinationPayable({destination});
// @ts-expect-error
isDestinationPayable({lnd});
// @ts-expect-error
isDestinationPayable({lnd, destination, outgoing_channels: '0x0x1'});

expectType<IsDestinationPayableResult>()(
  await isDestinationPayable({lnd, destination})
);
expectType<IsDestinationPayableResult>()(
  await isDestinationPayable({lnd, destination, outgoing_channels})
);

expectType<void>()(
  isDestinationPayable({lnd, destination}, (error, result) => {
    expectType<IsDestinationPayableResult>()(result);
  })
);
