import * as events from 'events';
import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {subscribeToPayViaRequest} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const request = 'request';

expectError(subscribeToPayViaRequest());
expectError(subscribeToPayViaRequest({}));
expectError(subscribeToPayViaRequest({lnd}));
expectError(subscribeToPayViaRequest({request}));

expectType<events.EventEmitter>(subscribeToPayViaRequest({lnd, request}));
