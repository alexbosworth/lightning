import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {openChannels, OpenChannelsResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

const channels = [
  {
    capacity: 1,
    partner_public_key: Buffer.alloc(33).toString('hex'),
  },
];
const cooperative_close_address = 'cooperative close address';
const give_tokens = 1;
const is_private = true;
const min_htlc_mtokens = '1';
const partner_csv_delay = 2;
const partner_socket = 'partner socket';
const channelsWithOptionalProperties = channels.map((channel) => ({
  ...channel,
  cooperative_close_address,
  give_tokens,
  is_private,
  min_htlc_mtokens,
  partner_csv_delay,
  partner_socket,
}));

expectError(openChannels());
expectError(openChannels({}));
expectError(openChannels({lnd}));

expectType<OpenChannelsResult>(await openChannels({lnd, channels}));
expectType<OpenChannelsResult>(
  await openChannels({lnd, channels: channelsWithOptionalProperties})
);

expectType<void>(
  openChannels({lnd, channels}, (error, result) => {
    expectType<OpenChannelsResult>(result);
  })
);
expectType<void>(
  openChannels(
    {lnd, channels: channelsWithOptionalProperties},
    (error, result) => {
      expectType<OpenChannelsResult>(result);
    }
  )
);
