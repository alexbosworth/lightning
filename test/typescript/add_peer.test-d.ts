import {expectError, expectType} from 'tsd';
import {addPeer} from '../../lnd_methods';
import {AuthenticatedLnd} from '../../lnd_grpc';

const lnd = {} as AuthenticatedLnd;
const public_key = Buffer.alloc(33).toString('hex');
const socket = 'socket';

expectError(addPeer());
expectError(addPeer({}));
expectError(addPeer({lnd}));
expectError(addPeer({lnd, public_key}));
expectError(addPeer({lnd, socket}));
expectType<void>(await addPeer({lnd, public_key, socket}));
expectType<void>(addPeer({lnd, public_key, socket}, error => {}));
