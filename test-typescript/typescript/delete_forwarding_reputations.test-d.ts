import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {deleteForwardingReputations} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

// @ts-expect-error
deleteForwardingReputations();
// @ts-expect-error
deleteForwardingReputations({});

expectType<void>()(await deleteForwardingReputations({lnd}));

expectType<void>()(deleteForwardingReputations({lnd}, () => {}));
