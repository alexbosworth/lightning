import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getChannelBalance, GetChannelBalanceResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

// @ts-expect-error
getChannelBalance();
// @ts-expect-error
getChannelBalance({});

expectType<GetChannelBalanceResult>()(await getChannelBalance({lnd}));

expectType<void>()(
  getChannelBalance({lnd}, (error, result) => {
    expectType<GetChannelBalanceResult>()(result);
  })
);
