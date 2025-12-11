import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {fundPendingChannels} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

const id = Buffer.alloc(32).toString('hex');
const channels = [id];
const funding = '01';

expectError(fundPendingChannels());
expectError(fundPendingChannels({}));
expectError(fundPendingChannels({channels}));
expectError(fundPendingChannels({channels, funding}));
expectError(fundPendingChannels({funding}));
expectError(fundPendingChannels({lnd, channels}));
expectError(fundPendingChannels({lnd, funding}));

expectType<void>(await fundPendingChannels({lnd, channels, funding}));

expectType<void>(fundPendingChannels({lnd, channels, funding}, (error) => {}));
