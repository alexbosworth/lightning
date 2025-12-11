import {expectError, expectType} from 'tsd';
import {updateColor} from '../../lnd_methods';
import {AuthenticatedLnd} from '../../lnd_grpc';

const lnd = {} as AuthenticatedLnd;
const color = 'color';

expectError(updateColor());
expectError(updateColor({}));
expectError(updateColor({lnd}));
expectError(updateColor({color}));

expectType<void>(await updateColor({lnd, color}));
expectType<void>(updateColor({lnd, color}, () => {}));
