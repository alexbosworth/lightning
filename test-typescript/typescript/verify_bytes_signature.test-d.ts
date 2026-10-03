import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {
  verifyBytesSignature,
  VerifyBytesSignatureResult,
} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const preimage = Buffer.alloc(32).toString('hex');
const public_key = Buffer.alloc(33).toString('hex');
const signature = '00';
const tag = 'tag';

// @ts-expect-error
verifyBytesSignature();
// @ts-expect-error
verifyBytesSignature({});
// @ts-expect-error
verifyBytesSignature({preimage});
// @ts-expect-error
verifyBytesSignature({preimage, public_key});
// @ts-expect-error
verifyBytesSignature({preimage, signature});
// @ts-expect-error
verifyBytesSignature({preimage, public_key, signature});
// @ts-expect-error
verifyBytesSignature({public_key});
// @ts-expect-error
verifyBytesSignature({public_key, signature});
// @ts-expect-error
verifyBytesSignature({signature});
// @ts-expect-error
verifyBytesSignature({lnd});
// @ts-expect-error
verifyBytesSignature({lnd, preimage});
// @ts-expect-error
verifyBytesSignature({lnd, preimage, public_key});
// @ts-expect-error
verifyBytesSignature({lnd, preimage, signature});
// @ts-expect-error
verifyBytesSignature({lnd, public_key});
// @ts-expect-error
verifyBytesSignature({lnd, public_key, signature});
// @ts-expect-error
verifyBytesSignature({lnd, signature});
// @ts-expect-error
verifyBytesSignature({lnd, preimage, public_key, signature, tag: 1});

expectType<VerifyBytesSignatureResult>()(
  await verifyBytesSignature({
    lnd,
    preimage,
    public_key,
    signature,
  })
);

expectType<VerifyBytesSignatureResult>()(
  await verifyBytesSignature({
    lnd,
    preimage,
    public_key,
    signature,
    tag,
  })
);

expectType<void>()(
  verifyBytesSignature(
    {lnd, preimage, public_key, signature},
    (error, result) => {
      expectType<VerifyBytesSignatureResult>()(result);
    }
  )
);
