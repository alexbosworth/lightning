import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {
  isDestinationPayable,
  IsDestinationPayableResult,
} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const destination = 'destination';

expectError(isDestinationPayable());
expectError(isDestinationPayable({}));
expectError(isDestinationPayable({destination}));
expectError(isDestinationPayable({lnd}));

expectType<IsDestinationPayableResult>(
  await isDestinationPayable({lnd, destination})
);

expectType<void>(
  isDestinationPayable({lnd, destination}, (error, result) => {
    expectType<IsDestinationPayableResult>(result);
  })
);
