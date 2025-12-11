import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {pay, PayResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const request =
  'lntb1500n1pdn4czkpp5ugdqer05qrrxuchrzkcue94th9w2xzasp9qm7d0yxcgp4uh4kn4qdpa2fjkzep6yprkcmmzv9kzqsmj09c8gmmrw4e8yetwvdujq5n9va6kcct5d9hkucqzysdlghdpua7uvjjkcfj49psxtlqzkp5pdncffdfk2cp3mp76thrl29qhqgzufm503pjj96586n5w6edgw3n66j4rxxs707y4zdjuhyt6qqe5weu4';
const path = {
  id: Buffer.alloc(32).toString('hex'),
  routes: [
    {
      fee: 1,
      fee_mtokens: '1000',
      hops: [
        {
          channel: '1x1x1',
          channel_capacity: 1,
          fee: 1,
          fee_mtokens: '1000',
          forward: 1,
          forward_mtokens: '1000',
          public_key: '01',
          timeout: 100,
        },
      ],
      mtokens: '1000',
      timeout: 100,
      tokens: 1,
    },
  ],
};

expectError(pay());
expectError(pay({}));

expectType<PayResult>(await pay({lnd}));
expectType<PayResult>(await pay({lnd, request}));
expectType<PayResult>(await pay({lnd, path}));

expectType<void>(
  pay({lnd}, (error, result) => {
    expectType<PayResult>(result);
  })
);
expectType<void>(
  pay({lnd, request}, (error, result) => {
    expectType<PayResult>(result);
  })
);
expectType<void>(
  pay({lnd, path}, (error, result) => {
    expectType<PayResult>(result);
  })
);
