import {expectType} from '../expect';
import {
  updateGroupSigningSession,
  UpdateGroupSigningSessionResult,
} from '../../lnd_methods';
import {AuthenticatedLnd} from '../../lnd_grpc';

const lnd = {} as AuthenticatedLnd;
const hash = 'hash';
const id = 'id';
const nonces = ['nonce'];

// @ts-expect-error
updateGroupSigningSession();
// @ts-expect-error
updateGroupSigningSession({});
// @ts-expect-error
updateGroupSigningSession({lnd});
// @ts-expect-error
updateGroupSigningSession({hash});
// @ts-expect-error
updateGroupSigningSession({id});
// @ts-expect-error
updateGroupSigningSession({nonces});
// @ts-expect-error
updateGroupSigningSession({lnd, hash});
// @ts-expect-error
updateGroupSigningSession({lnd, id});
// @ts-expect-error
updateGroupSigningSession({lnd, nonces});
// @ts-expect-error
updateGroupSigningSession({lnd, hash, id});
// @ts-expect-error
updateGroupSigningSession({lnd, hash, nonces});
// @ts-expect-error
updateGroupSigningSession({lnd, id, nonces});

expectType<UpdateGroupSigningSessionResult>()(
  await updateGroupSigningSession({lnd, hash, id, nonces})
);
expectType<void>()(updateGroupSigningSession({lnd, hash, id, nonces}, () => {}));
