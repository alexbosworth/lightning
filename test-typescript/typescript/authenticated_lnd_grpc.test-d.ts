import {expectType} from '../expect';
import {authenticatedLndGrpc, AuthenticatedLnd} from '../../lnd_grpc';

// @ts-expect-error
authenticatedLndGrpc();
expectType<{lnd: AuthenticatedLnd}>()(
  authenticatedLndGrpc({macaroon: Buffer.alloc(1).toString('hex')})
);
expectType<{lnd: AuthenticatedLnd}>()(
  authenticatedLndGrpc({cert: '00', macaroon: Buffer.alloc(1).toString('hex')})
);
expectType<{lnd: AuthenticatedLnd}>()(
  authenticatedLndGrpc({
    socket: 'socket',
    macaroon: Buffer.alloc(1).toString('hex'),
  })
);
expectType<{lnd: AuthenticatedLnd}>()(
  authenticatedLndGrpc({
    cert: '00',
    socket: 'socket',
    macaroon: Buffer.alloc(1).toString('hex'),
  })
);
