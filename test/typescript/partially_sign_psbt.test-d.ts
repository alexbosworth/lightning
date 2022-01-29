import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {partiallySignPsbt, PartiallySignPsbtResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const psbt = 'psbt';

expectError(partiallySignPsbt());
expectError(partiallySignPsbt({}));
expectError(partiallySignPsbt({lnd}));

expectType<PartiallySignPsbtResult>(await partiallySignPsbt({lnd, psbt}));

expectType<void>(
  partiallySignPsbt({lnd, psbt}, (error, result) => {
    expectType<PartiallySignPsbtResult>(result);
  })
);
