import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getPendingChannels, GetPendingChannelsResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

expectError(getPendingChannels());
expectError(getPendingChannels({}));

expectType<GetPendingChannelsResult>(await getPendingChannels({lnd}));

expectType<void>(
  getPendingChannels({lnd}, (error, result) => {
    expectType<GetPendingChannelsResult>(result);
  })
);
