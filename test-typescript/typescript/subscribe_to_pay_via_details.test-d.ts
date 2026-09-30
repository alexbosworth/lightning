import * as events from 'events';
import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {subscribeToPayViaDetails} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const destination = 'destination';
const outgoing_channels = ['0x0x1', '0x0x2'];

expectError(subscribeToPayViaDetails());
expectError(subscribeToPayViaDetails({}));
expectError(subscribeToPayViaDetails({lnd}));
expectError(subscribeToPayViaDetails({destination}));
expectError(
  subscribeToPayViaDetails({lnd, destination, outgoing_channels: '0x0x1'})
);

expectType<events.EventEmitter>(subscribeToPayViaDetails({lnd, destination}));
expectType<events.EventEmitter>(
  subscribeToPayViaDetails({lnd, destination, outgoing_channels})
);
