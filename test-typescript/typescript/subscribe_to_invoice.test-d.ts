import * as events from 'events';
import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {subscribeToInvoice} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const id = '00';

// @ts-expect-error
subscribeToInvoice();
// @ts-expect-error
subscribeToInvoice({});
// @ts-expect-error
subscribeToInvoice({id});
// @ts-expect-error
subscribeToInvoice({lnd});

expectType<events.EventEmitter>()(subscribeToInvoice({lnd, id}));
