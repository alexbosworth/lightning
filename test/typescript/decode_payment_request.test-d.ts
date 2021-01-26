import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {
  decodePaymentRequest,
  DecodePaymentRequestResult,
} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const request = 'request';

expectError(decodePaymentRequest());
expectError(decodePaymentRequest({}));
expectError(decodePaymentRequest({request}));
expectError(decodePaymentRequest({lnd}));

expectType<DecodePaymentRequestResult>(
  await decodePaymentRequest({lnd, request})
);

expectType<void>(
  decodePaymentRequest({lnd, request}, (error, result) => {
    expectType<DecodePaymentRequestResult>(result);
  })
);
