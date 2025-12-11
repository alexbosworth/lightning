import {expectError, expectType} from 'tsd';
import {authenticatedLndGrpc, AuthenticatedLnd} from '../../lnd_grpc';

expectError(authenticatedLndGrpc());
expectType<{lnd: AuthenticatedLnd}>(
  authenticatedLndGrpc({macaroon: Buffer.alloc(1).toString('hex')})
);
expectType<{lnd: AuthenticatedLnd}>(
  authenticatedLndGrpc({cert: '00', macaroon: Buffer.alloc(1).toString('hex')})
);
expectType<{lnd: AuthenticatedLnd}>(
  authenticatedLndGrpc({
    socket: 'socket',
    macaroon: Buffer.alloc(1).toString('hex'),
  })
);
expectType<{lnd: AuthenticatedLnd}>(
  authenticatedLndGrpc({
    cert: '00',
    socket: 'socket',
    macaroon: Buffer.alloc(1).toString('hex'),
  })
);
