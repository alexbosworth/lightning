import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {openChannel, OpenChannelResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

const local_tokens = 1e6;
const partner_public_key = Buffer.alloc(33).toString('hex');
const chain_fee_tokens_per_vbyte = 1;
const cooperative_close_address = 'close_address';
const give_tokens = 1;

expectError(openChannel());
expectError(openChannel({}));
expectError(openChannel({local_tokens}));
expectError(openChannel({partner_public_key}));
expectError(openChannel({lnd}));
expectError(openChannel({lnd, local_tokens}));
expectError(openChannel({lnd, partner_public_key}));

expectType<OpenChannelResult>(
  await openChannel({lnd, local_tokens, partner_public_key})
);
expectType<OpenChannelResult>(
  await openChannel({
    lnd,
    local_tokens,
    partner_public_key,
    chain_fee_tokens_per_vbyte,
    cooperative_close_address,
    give_tokens,
  })
);

expectType<void>(
  openChannel({lnd, local_tokens, partner_public_key}, (error, result) => {
    expectType<OpenChannelResult>(result);
  })
);
expectType<void>(
  openChannel(
    {
      lnd,
      local_tokens,
      partner_public_key,
      chain_fee_tokens_per_vbyte,
      cooperative_close_address,
      give_tokens,
    },
    (error, result) => {
      expectType<OpenChannelResult>(result);
    }
  )
);
