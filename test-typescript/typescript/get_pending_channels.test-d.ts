import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getPendingChannels, GetPendingChannelsResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

// @ts-expect-error
getPendingChannels();
// @ts-expect-error
getPendingChannels({});

expectType<GetPendingChannelsResult>()(await getPendingChannels({lnd}));

expectType<void>()(
  getPendingChannels({lnd}, (error, result) => {
    expectType<GetPendingChannelsResult>()(result);
  })
);
