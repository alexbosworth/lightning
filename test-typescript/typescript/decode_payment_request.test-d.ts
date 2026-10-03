import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {
  decodePaymentRequest,
  DecodePaymentRequestResult,
} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const request = 'request';

// @ts-expect-error
decodePaymentRequest();
// @ts-expect-error
decodePaymentRequest({});
// @ts-expect-error
decodePaymentRequest({request});
// @ts-expect-error
decodePaymentRequest({lnd});

expectType<DecodePaymentRequestResult>()(
  await decodePaymentRequest({lnd, request})
);

expectType<void>()(
  decodePaymentRequest({lnd, request}, (error, result) => {
    expectType<DecodePaymentRequestResult>()(result);
  })
);
