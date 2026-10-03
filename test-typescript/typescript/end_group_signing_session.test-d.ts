import {expectType} from '../expect';
import {
  endGroupSigningSession,
  EndGroupSigningSessionResult,
} from '../../lnd_methods';
import {AuthenticatedLnd} from '../../lnd_grpc';

const lnd = {} as AuthenticatedLnd;
const id = 'id';
const signatures = ['signature'];

// @ts-expect-error
endGroupSigningSession();
// @ts-expect-error
endGroupSigningSession({});
// @ts-expect-error
endGroupSigningSession({lnd});
// @ts-expect-error
endGroupSigningSession({id});

expectType<EndGroupSigningSessionResult>()(
  await endGroupSigningSession({lnd, id})
);
expectType<EndGroupSigningSessionResult>()(
  await endGroupSigningSession({lnd, id, signatures})
);
expectType<void>()(
  endGroupSigningSession({lnd, id}, (err, res) => {
    expectType<EndGroupSigningSessionResult>()(res);
  })
);
expectType<void>()(
  endGroupSigningSession({lnd, id, signatures}, (err, res) => {
    expectType<EndGroupSigningSessionResult>()(res);
  })
);
