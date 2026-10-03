import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {recoverFundsFromChannel} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const backup = 'backup';

// @ts-expect-error
recoverFundsFromChannel();
// @ts-expect-error
recoverFundsFromChannel({});
// @ts-expect-error
recoverFundsFromChannel({backup});
// @ts-expect-error
recoverFundsFromChannel({lnd});

expectType<void>()(await recoverFundsFromChannel({lnd, backup}));

expectType<void>()(recoverFundsFromChannel({lnd, backup}, (error, result) => {}));
