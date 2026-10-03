import * as events from 'events';
import {expectType} from '../expect';
import {UnauthenticatedLnd} from '../../lnd_grpc';
import {subscribeToWalletStatus} from '../../lnd_methods';

const lnd = {} as UnauthenticatedLnd;

// @ts-expect-error
subscribeToWalletStatus();
// @ts-expect-error
subscribeToWalletStatus({});

expectType<events.EventEmitter>()(subscribeToWalletStatus({lnd}));
