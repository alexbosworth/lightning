import {expectError, expectType} from 'tsd';
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

expectError(beginGroupSigningSession());
expectError(beginGroupSigningSession({}));
expectError(beginGroupSigningSession({lnd}));
expectError(beginGroupSigningSession({key_family}));
expectError(beginGroupSigningSession({key_index}));
expectError(beginGroupSigningSession({public_keys}));
expectError(beginGroupSigningSession({lnd, key_family}));
expectError(beginGroupSigningSession({lnd, key_index}));
expectError(beginGroupSigningSession({lnd, public_keys}));
expectError(beginGroupSigningSession({key_family, key_index}));
expectError(beginGroupSigningSession({key_family, public_keys}));
expectError(beginGroupSigningSession({key_index, public_keys}));
expectError(beginGroupSigningSession({lnd, key_family, key_index}));
expectError(beginGroupSigningSession({lnd, key_family, public_keys}));
expectError(beginGroupSigningSession({lnd, key_index, public_keys}));
expectError(beginGroupSigningSession({key_family, key_index, public_keys}));

expectType<BeginGroupSigningSessionResult>(
  await beginGroupSigningSession({lnd, key_family, key_index, public_keys})
);
expectType<BeginGroupSigningSessionResult>(
  await beginGroupSigningSession({
    lnd,
    key_family,
    key_index,
    public_keys,
    is_key_spend,
    root_hash,
  })
);
expectType<void>(
  beginGroupSigningSession(
    {lnd, key_family, key_index, public_keys},
    (err, res) => {
      expectType<BeginGroupSigningSessionResult>(res);
    }
  )
);
expectType<void>(
  beginGroupSigningSession(
    {lnd, key_family, key_index, public_keys, is_key_spend, root_hash},
    (err, res) => {
      expectType<BeginGroupSigningSessionResult>(res);
    }
  )
);
