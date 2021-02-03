import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {recoverFundsFromChannel} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const backup = 'backup';

expectError(recoverFundsFromChannel());
expectError(recoverFundsFromChannel({}));
expectError(recoverFundsFromChannel({backup}));
expectError(recoverFundsFromChannel({lnd}));

expectType<void>(await recoverFundsFromChannel({lnd, backup}));

expectType<void>(recoverFundsFromChannel({lnd, backup}, (error, result) => {}));
