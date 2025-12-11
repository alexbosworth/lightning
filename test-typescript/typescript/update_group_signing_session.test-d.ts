import {expectError, expectType} from 'tsd';
import {
  updateGroupSigningSession,
  UpdateGroupSigningSessionResult,
} from '../../lnd_methods';
import {AuthenticatedLnd} from '../../lnd_grpc';

const lnd = {} as AuthenticatedLnd;
const hash = 'hash';
const id = 'id';
const nonces = ['nonce'];

expectError(updateGroupSigningSession());
expectError(updateGroupSigningSession({}));
expectError(updateGroupSigningSession({lnd}));
expectError(updateGroupSigningSession({hash}));
expectError(updateGroupSigningSession({id}));
expectError(updateGroupSigningSession({nonces}));
expectError(updateGroupSigningSession({lnd, hash}));
expectError(updateGroupSigningSession({lnd, id}));
expectError(updateGroupSigningSession({lnd, nonces}));
expectError(updateGroupSigningSession({lnd, hash, id}));
expectError(updateGroupSigningSession({lnd, hash, nonces}));
expectError(updateGroupSigningSession({lnd, id, nonces}));

expectType<UpdateGroupSigningSessionResult>(
  await updateGroupSigningSession({lnd, hash, id, nonces})
);
expectType<void>(updateGroupSigningSession({lnd, hash, id, nonces}, () => {}));
