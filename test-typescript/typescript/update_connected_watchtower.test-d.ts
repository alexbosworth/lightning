import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {updateConnectedWatchtower} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

const public_key = 'pubkey';
const add_socket = 'socket';
const remove_socket = 'socket';

// @ts-expect-error
updateConnectedWatchtower();
// @ts-expect-error
updateConnectedWatchtower({});
// @ts-expect-error
updateConnectedWatchtower({lnd});
// @ts-expect-error
updateConnectedWatchtower({public_key});
// @ts-expect-error
updateConnectedWatchtower({add_socket});
// @ts-expect-error
updateConnectedWatchtower({remove_socket});
// @ts-expect-error
updateConnectedWatchtower({lnd, public_key});
// @ts-expect-error
updateConnectedWatchtower({lnd, add_socket});
// @ts-expect-error
updateConnectedWatchtower({lnd, remove_socket});
// @ts-expect-error
updateConnectedWatchtower({lnd, public_key, add_socket, remove_socket});

expectType<void>()(
  await updateConnectedWatchtower({lnd, public_key, add_socket})
);
expectType<void>()(
  await updateConnectedWatchtower({lnd, public_key, remove_socket})
);

expectType<void>()(
  updateConnectedWatchtower({lnd, public_key, add_socket}, () => {})
);
expectType<void>()(
  updateConnectedWatchtower({lnd, public_key, remove_socket}, () => {})
);
