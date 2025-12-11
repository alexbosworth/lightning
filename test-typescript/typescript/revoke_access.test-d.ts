import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {revokeAccess} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const id = '1';

expectError(revokeAccess());
expectError(revokeAccess({}));
expectError(revokeAccess({id}));
expectError(revokeAccess({lnd}));

expectType<void>(await revokeAccess({lnd, id}));

expectType<void>(revokeAccess({lnd, id}, () => {}));
