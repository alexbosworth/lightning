import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {
  verifyBytesSignature,
  VerifyBytesSignatureResult,
} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const preimage = Buffer.alloc(32).toString('hex');
const public_key = Buffer.alloc(33).toString('hex');
const signature = '00';

expectError(verifyBytesSignature());
expectError(verifyBytesSignature({}));
expectError(verifyBytesSignature({preimage}));
expectError(verifyBytesSignature({preimage, public_key}));
expectError(verifyBytesSignature({preimage, signature}));
expectError(verifyBytesSignature({preimage, public_key, signature}));
expectError(verifyBytesSignature({public_key}));
expectError(verifyBytesSignature({public_key, signature}));
expectError(verifyBytesSignature({signature}));
expectError(verifyBytesSignature({lnd}));
expectError(verifyBytesSignature({lnd, preimage}));
expectError(verifyBytesSignature({lnd, preimage, public_key}));
expectError(verifyBytesSignature({lnd, preimage, signature}));
expectError(verifyBytesSignature({lnd, public_key}));
expectError(verifyBytesSignature({lnd, public_key, signature}));
expectError(verifyBytesSignature({lnd, signature}));

expectType<VerifyBytesSignatureResult>(
  await verifyBytesSignature({
    lnd,
    preimage,
    public_key,
    signature,
  })
);

expectType<void>(
  verifyBytesSignature(
    {lnd, preimage, public_key, signature},
    (error, result) => {
      expectType<VerifyBytesSignatureResult>(result);
    }
  )
);
