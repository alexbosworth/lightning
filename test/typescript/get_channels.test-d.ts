import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getChannels, GetChannelsResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const is_active = true;
const is_offline = true;
const is_private = true;
const is_public = true;
const partner_public_key = 'pubkey';

expectError(getChannels());
expectError(getChannels({}));

expectType<GetChannelsResult>(await getChannels({lnd}));
expectType<GetChannelsResult>(
  await getChannels({
    lnd,
    is_active,
    is_offline,
    is_private,
    is_public,
    partner_public_key,
  })
);

expectType<void>(
  getChannels({lnd}, (error, result) => {
    expectType<GetChannelsResult>(result);
  })
);
expectType<void>(
  getChannels(
    {lnd, is_active, is_offline, is_private, is_public, partner_public_key},
    (error, result) => {
      expectType<GetChannelsResult>(result);
    }
  )
);
