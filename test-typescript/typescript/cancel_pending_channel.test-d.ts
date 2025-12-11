import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {cancelPendingChannel} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const id = 'id';

expectError(cancelPendingChannel());
expectError(cancelPendingChannel({}));
expectError(cancelPendingChannel({id}));
expectError(cancelPendingChannel({lnd}));

expectType<void>(await cancelPendingChannel({lnd, id}));

expectType<void>(cancelPendingChannel({lnd, id}, (error) => {}));
