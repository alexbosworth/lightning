import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {signTransaction, SignTransactionResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const inputs = [
  {
    key_family: 0,
    key_index: 0,
    output_script: '00',
    output_tokens: 1,
    sighash: 1,
    vin: 0,
  },
];
const spending = [
  {
    output_script: 'script',
    output_tokens: 0,
  },
];
const transaction = '00';

// @ts-expect-error
signTransaction();
// @ts-expect-error
signTransaction({});
// @ts-expect-error
signTransaction({inputs});
// @ts-expect-error
signTransaction({transaction});
// @ts-expect-error
signTransaction({inputs, transaction});
// @ts-expect-error
signTransaction({lnd});
// @ts-expect-error
signTransaction({lnd, inputs});
// @ts-expect-error
signTransaction({lnd, transaction});

expectType<SignTransactionResult>()(
  await signTransaction({
    lnd,
    inputs,
    transaction,
  })
);
expectType<SignTransactionResult>()(
  await signTransaction({
    lnd,
    inputs,
    transaction,
    spending,
  })
);

expectType<void>()(
  signTransaction({lnd, inputs, transaction}, (error, result) => {
    expectType<SignTransactionResult>()(result);
  })
);
expectType<void>()(
  signTransaction({lnd, inputs, transaction, spending}, (error, result) => {
    expectType<SignTransactionResult>()(result);
  })
);
