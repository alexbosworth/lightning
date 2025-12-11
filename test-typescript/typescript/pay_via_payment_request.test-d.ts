import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {
  payViaPaymentRequest,
  PayViaPaymentRequestResult,
} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const request =
  'lntb1500n1pdn4czkpp5ugdqer05qrrxuchrzkcue94th9w2xzasp9qm7d0yxcgp4uh4kn4qdpa2fjkzep6yprkcmmzv9kzqsmj09c8gmmrw4e8yetwvdujq5n9va6kcct5d9hkucqzysdlghdpua7uvjjkcfj49psxtlqzkp5pdncffdfk2cp3mp76thrl29qhqgzufm503pjj96586n5w6edgw3n66j4rxxs707y4zdjuhyt6qqe5weu4';

expectError(payViaPaymentRequest());
expectError(payViaPaymentRequest({}));
expectError(payViaPaymentRequest({request}));
expectError(payViaPaymentRequest({lnd}));

expectType<PayViaPaymentRequestResult>(
  await payViaPaymentRequest({lnd, request})
);

expectType<void>(
  payViaPaymentRequest({lnd, request}, (error, result) => {
    expectType<PayViaPaymentRequestResult>(result);
  })
);
