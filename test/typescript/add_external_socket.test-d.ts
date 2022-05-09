import {expectError, expectType} from 'tsd';
import {addExternalSocket} from '../../lnd_methods';
import {AuthenticatedLnd} from '../../lnd_grpc';

const lnd = {} as AuthenticatedLnd;
const socket = 'socket';

expectError(addExternalSocket());
expectError(addExternalSocket({}));
expectError(addExternalSocket({lnd}));
expectError(addExternalSocket({socket}));

expectType<void>(await addExternalSocket({lnd, socket}));
expectType<void>(addExternalSocket({lnd, socket}, () => {}));
