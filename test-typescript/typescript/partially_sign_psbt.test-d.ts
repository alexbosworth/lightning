import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {partiallySignPsbt, PartiallySignPsbtResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const psbt = 'psbt';

// @ts-expect-error
partiallySignPsbt();
// @ts-expect-error
partiallySignPsbt({});
// @ts-expect-error
partiallySignPsbt({lnd});

expectType<PartiallySignPsbtResult>()(await partiallySignPsbt({lnd, psbt}));

expectType<void>()(
  partiallySignPsbt({lnd, psbt}, (error, result) => {
    expectType<PartiallySignPsbtResult>()(result);
  })
);
