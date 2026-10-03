import {expectType} from '../expect';
import {
  beginGroupSigningSession,
  BeginGroupSigningSessionResult,
} from '../../lnd_methods';
import {AuthenticatedLnd} from '../../lnd_grpc';

const lnd = {} as AuthenticatedLnd;
const is_key_spend = true;
const key_family = 0;
const key_index = 0;
const public_keys = ['pubkey'];
const root_hash = 'root hash';

// @ts-expect-error
beginGroupSigningSession();
// @ts-expect-error
beginGroupSigningSession({});
// @ts-expect-error
beginGroupSigningSession({lnd});
// @ts-expect-error
beginGroupSigningSession({key_family});
// @ts-expect-error
beginGroupSigningSession({key_index});
// @ts-expect-error
beginGroupSigningSession({public_keys});
// @ts-expect-error
beginGroupSigningSession({lnd, key_family});
// @ts-expect-error
beginGroupSigningSession({lnd, key_index});
// @ts-expect-error
beginGroupSigningSession({lnd, public_keys});
// @ts-expect-error
beginGroupSigningSession({key_family, key_index});
// @ts-expect-error
beginGroupSigningSession({key_family, public_keys});
// @ts-expect-error
beginGroupSigningSession({key_index, public_keys});
// @ts-expect-error
beginGroupSigningSession({lnd, key_family, key_index});
// @ts-expect-error
beginGroupSigningSession({lnd, key_family, public_keys});
// @ts-expect-error
beginGroupSigningSession({lnd, key_index, public_keys});
// @ts-expect-error
beginGroupSigningSession({key_family, key_index, public_keys});

expectType<BeginGroupSigningSessionResult>()(
  await beginGroupSigningSession({lnd, key_family, key_index, public_keys})
);
expectType<BeginGroupSigningSessionResult>()(
  await beginGroupSigningSession({
    lnd,
    key_family,
    key_index,
    public_keys,
    is_key_spend,
    root_hash,
  })
);
expectType<void>()(
  beginGroupSigningSession(
    {lnd, key_family, key_index, public_keys},
    (err, res) => {
      expectType<BeginGroupSigningSessionResult>()(res);
    }
  )
);
expectType<void>()(
  beginGroupSigningSession(
    {lnd, key_family, key_index, public_keys, is_key_spend, root_hash},
    (err, res) => {
      expectType<BeginGroupSigningSessionResult>()(res);
    }
  )
);
