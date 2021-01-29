import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {connectWatchtower} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const public_key = Buffer.alloc(33, 3).toString('hex');
const socket = 'socket';

expectError(connectWatchtower());
expectError(connectWatchtower({public_key}));
expectError(connectWatchtower({public_key, socket}));
expectError(connectWatchtower({socket}));
expectError(connectWatchtower({lnd}));
expectError(connectWatchtower({lnd, public_key}));
expectError(connectWatchtower({lnd, socket}));

expectType<void>(await connectWatchtower({lnd, public_key, socket}));

expectType<void>(connectWatchtower({lnd, public_key, socket}, () => {}));
