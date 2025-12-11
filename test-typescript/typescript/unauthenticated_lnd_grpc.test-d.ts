import {expectType, expectError} from 'tsd';
import {unauthenticatedLndGrpc, UnauthenticatedLnd} from '../../lnd_grpc';

expectType<{lnd: UnauthenticatedLnd}>(unauthenticatedLndGrpc({}));
expectType<{lnd: UnauthenticatedLnd}>(unauthenticatedLndGrpc({cert: '00'}));
expectType<{lnd: UnauthenticatedLnd}>(
  unauthenticatedLndGrpc({socket: 'socket'})
);
expectType<{lnd: UnauthenticatedLnd}>(
  unauthenticatedLndGrpc({cert: '00', socket: 'socket'})
);
