import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {disconnectWatchtower} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const public_key = 'pubkey';
const retry_delay = 2100;

expectError(disconnectWatchtower());
expectError(disconnectWatchtower({}));
expectError(disconnectWatchtower({lnd}));
expectError(disconnectWatchtower({public_key}));

expectType<void>(await disconnectWatchtower({lnd, public_key}));

expectType<void>(disconnectWatchtower({lnd, public_key}, () => {}));
