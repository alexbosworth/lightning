import {expectType} from '../expect';
import {addPeer} from '../../lnd_methods';
import {AuthenticatedLnd} from '../../lnd_grpc';

const lnd = {} as AuthenticatedLnd;
const public_key = Buffer.alloc(33).toString('hex');
const socket = 'socket';

// @ts-expect-error
addPeer();
// @ts-expect-error
addPeer({});
// @ts-expect-error
addPeer({lnd});
// @ts-expect-error
addPeer({lnd, public_key});
// @ts-expect-error
addPeer({lnd, socket});
expectType<void>()(await addPeer({lnd, public_key, socket}));
expectType<void>()(addPeer({lnd, public_key, socket}, error => {}));
