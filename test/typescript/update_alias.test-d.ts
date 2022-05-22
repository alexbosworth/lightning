import {expectError, expectType} from 'tsd';
import {updateAlias} from '../../lnd_methods';
import {AuthenticatedLnd} from '../../lnd_grpc';

const lnd = {} as AuthenticatedLnd;
const node = 'node';

expectError(updateAlias());
expectError(updateAlias({}));
expectError(updateAlias({lnd}));
expectError(updateAlias({node}));

expectType<void>(await updateAlias({lnd, node}));
expectType<void>(updateAlias({lnd, node}, () => {}));
