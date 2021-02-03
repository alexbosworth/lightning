import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {attemptRoute} from '../../lnd_methods/offchain/attempt_route';

const lnd = {} as AuthenticatedLnd;
const max_timeout_height = 1;
const path_timeout_ms = 1000;
const public_key = 'pubkey';
const route = {
  fee: 1,
  fee_mtokens: '1',
  hops: [
    {
      channel: 'channel',
      channel_capacity: 1,
      fee: 1,
      fee_mtokens: '1',
      forward: 1,
      forward_mtokens: '1',
      public_key: 'pubkey',
      timeout: 1,
    },
  ],
  messages: [
    {
      type: 'type',
      value: 'value',
    },
  ],
  mtokens: '1',
  payment: 'payment',
  timeout: 1,
  tokens: 1,
  total_mtokens: '1',
};

expectError(attemptRoute());
expectError(attemptRoute({}));
expectError(attemptRoute({lnd}));

expectType<void>(
  await attemptRoute({lnd, max_timeout_height, path_timeout_ms, public_key})
);
expectType<void>(
  await attemptRoute({
    lnd,
    max_timeout_height,
    path_timeout_ms,
    public_key,
    route,
  })
);

expectType<void>(
  attemptRoute({lnd, max_timeout_height, path_timeout_ms, public_key}, () => {})
);
expectType<void>(
  attemptRoute(
    {lnd, max_timeout_height, path_timeout_ms, public_key, route},
    () => {}
  )
);
