import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {updateConnectedWatchtower} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

const public_key = 'pubkey';
const add_socket = 'socket';
const remove_socket = 'socket';

expectError(updateConnectedWatchtower());
expectError(updateConnectedWatchtower({}));
expectError(updateConnectedWatchtower({lnd}));
expectError(updateConnectedWatchtower({public_key}));
expectError(updateConnectedWatchtower({add_socket}));
expectError(updateConnectedWatchtower({remove_socket}));
expectError(updateConnectedWatchtower({lnd, public_key}));
expectError(updateConnectedWatchtower({lnd, add_socket}));
expectError(updateConnectedWatchtower({lnd, remove_socket}));
expectError(
  updateConnectedWatchtower({lnd, public_key, add_socket, remove_socket})
);

expectType<void>(
  await updateConnectedWatchtower({lnd, public_key, add_socket})
);
expectType<void>(
  await updateConnectedWatchtower({lnd, public_key, remove_socket})
);

expectType<void>(
  updateConnectedWatchtower({lnd, public_key, add_socket}, () => {})
);
expectType<void>(
  updateConnectedWatchtower({lnd, public_key, remove_socket}, () => {})
);
