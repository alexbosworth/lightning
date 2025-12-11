import * as events from 'events';
import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {subscribeToPayViaDetails} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const destination = 'destination';

expectError(subscribeToPayViaDetails());
expectError(subscribeToPayViaDetails({}));
expectError(subscribeToPayViaDetails({lnd}));
expectError(subscribeToPayViaDetails({destination}));

expectType<events.EventEmitter>(subscribeToPayViaDetails({lnd, destination}));
