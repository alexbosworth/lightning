import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {recoverFundsFromChannels} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const backup = 'backup';

// @ts-expect-error
recoverFundsFromChannels();
// @ts-expect-error
recoverFundsFromChannels({});
// @ts-expect-error
recoverFundsFromChannels({backup});
// @ts-expect-error
recoverFundsFromChannels({lnd});

expectType<void>()(await recoverFundsFromChannels({lnd, backup}));

expectType<void>()(
  recoverFundsFromChannels({lnd, backup}, (error, result) => {})
);
