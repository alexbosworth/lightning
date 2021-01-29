import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getClosedChannels, GetClosedChannelsResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const is_breach_close = true;
const is_cooperative_close = true;
const is_funding_cancel = true;
const is_local_force_close = true;
const is_remote_force_close = true;

expectError(getClosedChannels());
expectError(getClosedChannels({}));

expectType<GetClosedChannelsResult>(await getClosedChannels({lnd}));
expectType<GetClosedChannelsResult>(
  await getClosedChannels({
    lnd,
    is_breach_close,
    is_cooperative_close,
    is_funding_cancel,
    is_local_force_close,
    is_remote_force_close,
  })
);

expectType<void>(
  getClosedChannels({lnd}, (error, result) => {
    expectType<GetClosedChannelsResult>(result);
  })
);
expectType<void>(
  getClosedChannels(
    {
      lnd,
      is_breach_close,
      is_cooperative_close,
      is_funding_cancel,
      is_local_force_close,
      is_remote_force_close,
    },
    (error, result) => {
      expectType<GetClosedChannelsResult>(result);
    }
  )
);
