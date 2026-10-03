import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {verifyAccess, VerifyAccessResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const macaroon = 'macaroon';
const permissions = ['entity:action'];

// @ts-expect-error
verifyAccess();
// @ts-expect-error
verifyAccess({});
// @ts-expect-error
verifyAccess({lnd});
// @ts-expect-error
verifyAccess({lnd, macaroon});
// @ts-expect-error
verifyAccess({lnd, permissions});

expectType<VerifyAccessResult>()(
  await verifyAccess({lnd, macaroon, permissions})
);

expectType<void>()(
  verifyAccess({lnd, macaroon, permissions}, (err, res) => {
    expectType<VerifyAccessResult>()(res);
  })
);
