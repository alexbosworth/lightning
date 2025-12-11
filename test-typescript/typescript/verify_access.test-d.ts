import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {verifyAccess, VerifyAccessResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const macaroon = 'macaroon';
const permissions = ['entity:action'];

expectError(verifyAccess());
expectError(verifyAccess({}));
expectError(verifyAccess({lnd}));
expectError(verifyAccess({lnd, macaroon}));
expectError(verifyAccess({lnd, permissions}));

expectType<VerifyAccessResult>(
  await verifyAccess({lnd, macaroon, permissions})
);

expectType<void>(
  verifyAccess({lnd, macaroon, permissions}, (err, res) => {
    expectType<VerifyAccessResult>(res);
  })
);
