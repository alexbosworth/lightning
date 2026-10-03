import * as events from 'events';
import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {subscribeToPayViaRequest} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const request = 'request';

// @ts-expect-error
subscribeToPayViaRequest();
// @ts-expect-error
subscribeToPayViaRequest({});
// @ts-expect-error
subscribeToPayViaRequest({lnd});
// @ts-expect-error
subscribeToPayViaRequest({request});

expectType<events.EventEmitter>()(subscribeToPayViaRequest({lnd, request}));
