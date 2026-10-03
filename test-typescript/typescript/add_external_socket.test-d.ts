import {expectType} from '../expect';
import {addExternalSocket} from '../../lnd_methods';
import {AuthenticatedLnd} from '../../lnd_grpc';

const lnd = {} as AuthenticatedLnd;
const socket = 'socket';

// @ts-expect-error
addExternalSocket();
// @ts-expect-error
addExternalSocket({});
// @ts-expect-error
addExternalSocket({lnd});
// @ts-expect-error
addExternalSocket({socket});

expectType<void>()(await addExternalSocket({lnd, socket}));
expectType<void>()(addExternalSocket({lnd, socket}, () => {}));
