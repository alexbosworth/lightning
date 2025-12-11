import * as events from 'events';
import {expectError, expectType} from 'tsd';
import {UnauthenticatedLnd} from '../../lnd_grpc';
import {subscribeToWalletStatus} from '../../lnd_methods';

const lnd = {} as UnauthenticatedLnd;

expectError(subscribeToWalletStatus());
expectError(subscribeToWalletStatus({}));

expectType<events.EventEmitter>(subscribeToWalletStatus({lnd}));
