import * as events from 'events';
import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {subscribeToPayViaDetails} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const destination = 'destination';
const outgoing_channels = ['0x0x1', '0x0x2'];

// @ts-expect-error
subscribeToPayViaDetails();
// @ts-expect-error
subscribeToPayViaDetails({});
// @ts-expect-error
subscribeToPayViaDetails({lnd});
// @ts-expect-error
subscribeToPayViaDetails({destination});
// @ts-expect-error
subscribeToPayViaDetails({lnd, destination, outgoing_channels: '0x0x1'});

expectType<events.EventEmitter>()(subscribeToPayViaDetails({lnd, destination}));
expectType<events.EventEmitter>()(
  subscribeToPayViaDetails({lnd, destination, outgoing_channels})
);
