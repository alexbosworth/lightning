import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {recoverFundsFromChannels} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const backup = 'backup';

expectError(recoverFundsFromChannels());
expectError(recoverFundsFromChannels({}));
expectError(recoverFundsFromChannels({backup}));
expectError(recoverFundsFromChannels({lnd}));

expectType<void>(await recoverFundsFromChannels({lnd, backup}));

expectType<void>(
  recoverFundsFromChannels({lnd, backup}, (error, result) => {})
);
