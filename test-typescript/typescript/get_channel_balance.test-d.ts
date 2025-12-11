import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getChannelBalance, GetChannelBalanceResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

expectError(getChannelBalance());
expectError(getChannelBalance({}));

expectType<GetChannelBalanceResult>(await getChannelBalance({lnd}));

expectType<void>(
  getChannelBalance({lnd}, (error, result) => {
    expectType<GetChannelBalanceResult>(result);
  })
);
