import {expectType} from '../expect';
import {updateColor} from '../../lnd_methods';
import {AuthenticatedLnd} from '../../lnd_grpc';

const lnd = {} as AuthenticatedLnd;
const color = 'color';

// @ts-expect-error
updateColor();
// @ts-expect-error
updateColor({});
// @ts-expect-error
updateColor({lnd});
// @ts-expect-error
updateColor({color});

expectType<void>()(await updateColor({lnd, color}));
expectType<void>()(updateColor({lnd, color}, () => {}));
