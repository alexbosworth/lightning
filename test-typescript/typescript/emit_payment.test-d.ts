import {EventEmitter} from 'events';
import {expectType} from '../expect';
import {emitPayment} from '../../lnd_methods/offchain/emit_payment';

const emitter = new EventEmitter();

// @ts-expect-error
emitPayment();
// @ts-expect-error
emitPayment({});
// @ts-expect-error
emitPayment({data: {status: 'invalid status'}, emitter});

expectType<boolean | undefined>()(
  emitPayment({
    data: {
      status: 'SUCCEEDED',
    },
    emitter,
  })
);
