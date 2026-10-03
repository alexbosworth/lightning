import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {stopDaemon} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

// @ts-expect-error
stopDaemon();
// @ts-expect-error
stopDaemon({});

expectType<void>()(await stopDaemon({lnd}));

expectType<void>()(stopDaemon({lnd}, error => {}));
