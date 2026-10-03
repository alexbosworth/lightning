import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {openChannel, OpenChannelResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

const local_tokens = 1e6;
const partner_public_key = Buffer.alloc(33).toString('hex');
const chain_fee_tokens_per_vbyte = 1;
const cooperative_close_address = 'close_address';
const give_tokens = 1;

const is_max_funding = true;
const inputs = [{transaction_id: 'id', transaction_vout: 0}];

// @ts-expect-error
openChannel();
// @ts-expect-error
openChannel({});
// @ts-expect-error
openChannel({local_tokens});
// @ts-expect-error
openChannel({partner_public_key});
// @ts-expect-error
openChannel({lnd});
// @ts-expect-error
openChannel({lnd, local_tokens});
// @ts-expect-error
openChannel({lnd, partner_public_key});

expectType<OpenChannelResult>()(
  await openChannel({lnd, local_tokens, partner_public_key})
);
expectType<OpenChannelResult>()(
  await openChannel({
    lnd,
    local_tokens,
    partner_public_key,
    chain_fee_tokens_per_vbyte,
    cooperative_close_address,
    give_tokens,
    is_max_funding,
    inputs,
  })
);

expectType<void>()(
  openChannel({lnd, local_tokens, partner_public_key}, (error, result) => {
    expectType<OpenChannelResult>()(result);
  })
);
expectType<void>()(
  openChannel(
    {
      lnd,
      local_tokens,
      partner_public_key,
      chain_fee_tokens_per_vbyte,
      cooperative_close_address,
      give_tokens,
      is_max_funding,
      inputs,
    },
    (error, result) => {
      expectType<OpenChannelResult>()(result);
    }
  )
);
