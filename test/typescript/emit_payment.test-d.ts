import {EventEmitter} from 'events';
import {expectError, expectType} from 'tsd';
import {emitPayment} from '../../lnd_methods/offchain/emit_payment';

const emitter = new EventEmitter();

expectError(emitPayment());
expectError(emitPayment({}));
expectError(emitPayment({data: {status: 'invalid status'}, emitter}));

expectType<boolean | undefined>(
  emitPayment({
    data: {
      status: 'SUCCEEDED',
    },
    emitter,
  })
);
