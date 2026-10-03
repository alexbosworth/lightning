import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {fundPendingChannels} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

const id = Buffer.alloc(32).toString('hex');
const channels = [id];
const funding = '01';

// @ts-expect-error
fundPendingChannels();
// @ts-expect-error
fundPendingChannels({});
// @ts-expect-error
fundPendingChannels({channels});
// @ts-expect-error
fundPendingChannels({channels, funding});
// @ts-expect-error
fundPendingChannels({funding});
// @ts-expect-error
fundPendingChannels({lnd, channels});
// @ts-expect-error
fundPendingChannels({lnd, funding});

expectType<void>()(await fundPendingChannels({lnd, channels, funding}));

expectType<void>()(fundPendingChannels({lnd, channels, funding}, (error) => {}));
