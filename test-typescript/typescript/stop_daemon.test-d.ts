import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {stopDaemon} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

expectError(stopDaemon());
expectError(stopDaemon({}));

expectType<void>(await stopDaemon({lnd}));

expectType<void>(stopDaemon({lnd}, error => {}));
