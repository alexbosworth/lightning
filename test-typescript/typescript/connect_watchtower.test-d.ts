import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {connectWatchtower} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const public_key = Buffer.alloc(33, 3).toString('hex');
const socket = 'socket';

// @ts-expect-error
connectWatchtower();
// @ts-expect-error
connectWatchtower({public_key});
// @ts-expect-error
connectWatchtower({public_key, socket});
// @ts-expect-error
connectWatchtower({socket});
// @ts-expect-error
connectWatchtower({lnd});
// @ts-expect-error
connectWatchtower({lnd, public_key});
// @ts-expect-error
connectWatchtower({lnd, socket});

expectType<void>()(await connectWatchtower({lnd, public_key, socket}));

expectType<void>()(connectWatchtower({lnd, public_key, socket}, () => {}));
