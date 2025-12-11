import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {signPsbt, SignPsbtResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

const psbt = 'psbt';

expectError(signPsbt());
expectError(signPsbt({}));
expectError(signPsbt({lnd}));

expectType<SignPsbtResult>(await signPsbt({lnd, psbt}));

expectType<void>(
  signPsbt({lnd, psbt}, (error, result) => {
    expectType<SignPsbtResult>(result);
  })
);
