import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {revokeAccess} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const id = '1';

// @ts-expect-error
revokeAccess();
// @ts-expect-error
revokeAccess({});
// @ts-expect-error
revokeAccess({id});
// @ts-expect-error
revokeAccess({lnd});

expectType<void>()(await revokeAccess({lnd, id}));

expectType<void>()(revokeAccess({lnd, id}, () => {}));
