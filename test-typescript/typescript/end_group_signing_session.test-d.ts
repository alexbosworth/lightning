import {expectError, expectType} from 'tsd';
import {
  endGroupSigningSession,
  EndGroupSigningSessionResult,
} from '../../lnd_methods';
import {AuthenticatedLnd} from '../../lnd_grpc';

const lnd = {} as AuthenticatedLnd;
const id = 'id';
const signatures = ['signature'];

expectError(endGroupSigningSession());
expectError(endGroupSigningSession({}));
expectError(endGroupSigningSession({lnd}));
expectError(endGroupSigningSession({id}));

expectType<EndGroupSigningSessionResult>(
  await endGroupSigningSession({lnd, id})
);
expectType<EndGroupSigningSessionResult>(
  await endGroupSigningSession({lnd, id, signatures})
);
expectType<void>(
  endGroupSigningSession({lnd, id}, (err, res) => {
    expectType<EndGroupSigningSessionResult>(res);
  })
);
expectType<void>(
  endGroupSigningSession({lnd, id, signatures}, (err, res) => {
    expectType<EndGroupSigningSessionResult>(res);
  })
);
