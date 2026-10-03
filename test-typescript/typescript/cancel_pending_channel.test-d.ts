import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {cancelPendingChannel} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const id = 'id';

// @ts-expect-error
cancelPendingChannel();
// @ts-expect-error
cancelPendingChannel({});
// @ts-expect-error
cancelPendingChannel({id});
// @ts-expect-error
cancelPendingChannel({lnd});

expectType<void>()(await cancelPendingChannel({lnd, id}));

expectType<void>()(cancelPendingChannel({lnd, id}, (error) => {}));
