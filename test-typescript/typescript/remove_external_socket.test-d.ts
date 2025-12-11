import {expectError, expectType} from 'tsd';
import {removeExternalSocket} from '../../lnd_methods';
import {AuthenticatedLnd} from '../../lnd_grpc';

const lnd = {} as AuthenticatedLnd;
const socket = 'socket';

expectError(removeExternalSocket());
expectError(removeExternalSocket({}));
expectError(removeExternalSocket({lnd}));
expectError(removeExternalSocket({socket}));

expectType<void>(await removeExternalSocket({lnd, socket}));
expectType<void>(removeExternalSocket({lnd, socket}, () => {}));
