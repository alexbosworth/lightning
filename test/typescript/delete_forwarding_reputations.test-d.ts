import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {deleteForwardingReputations} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

expectError(deleteForwardingReputations());
expectError(deleteForwardingReputations({}));

expectType<void>(await deleteForwardingReputations({lnd}));

expectType<void>(deleteForwardingReputations({lnd}, () => {}));
