import {expectType} from '../expect';
import {removeExternalSocket} from '../../lnd_methods';
import {AuthenticatedLnd} from '../../lnd_grpc';

const lnd = {} as AuthenticatedLnd;
const socket = 'socket';

// @ts-expect-error
removeExternalSocket();
// @ts-expect-error
removeExternalSocket({});
// @ts-expect-error
removeExternalSocket({lnd});
// @ts-expect-error
removeExternalSocket({socket});

expectType<void>()(await removeExternalSocket({lnd, socket}));
expectType<void>()(removeExternalSocket({lnd, socket}, () => {}));
