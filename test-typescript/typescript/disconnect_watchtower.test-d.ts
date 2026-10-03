import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {disconnectWatchtower} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const public_key = 'pubkey';
const retry_delay = 2100;

// @ts-expect-error
disconnectWatchtower();
// @ts-expect-error
disconnectWatchtower({});
// @ts-expect-error
disconnectWatchtower({lnd});
// @ts-expect-error
disconnectWatchtower({public_key});

expectType<void>()(await disconnectWatchtower({lnd, public_key}));

expectType<void>()(disconnectWatchtower({lnd, public_key}, () => {}));
