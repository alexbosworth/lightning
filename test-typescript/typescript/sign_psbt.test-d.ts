import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {signPsbt, SignPsbtResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

const psbt = 'psbt';

// @ts-expect-error
signPsbt();
// @ts-expect-error
signPsbt({});
// @ts-expect-error
signPsbt({lnd});

expectType<SignPsbtResult>()(await signPsbt({lnd, psbt}));

expectType<void>()(
  signPsbt({lnd, psbt}, (error, result) => {
    expectType<SignPsbtResult>()(result);
  })
);
