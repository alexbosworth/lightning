import {expectType} from '../expect';
import {updateAlias} from '../../lnd_methods';
import {AuthenticatedLnd} from '../../lnd_grpc';

const lnd = {} as AuthenticatedLnd;
const node = 'node';

// @ts-expect-error
updateAlias();
// @ts-expect-error
updateAlias({});
// @ts-expect-error
updateAlias({lnd});
// @ts-expect-error
updateAlias({node});

expectType<void>()(await updateAlias({lnd, node}));
expectType<void>()(updateAlias({lnd, node}, () => {}));
