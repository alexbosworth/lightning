import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {signBytes, SignBytesResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const key_family = 0;
const key_index = 0;
const preimage = '00';
const tag = 'tag';
const type = 'schnorr';

// @ts-expect-error
signBytes();
// @ts-expect-error
signBytes({});
// @ts-expect-error
signBytes({key_family});
// @ts-expect-error
signBytes({key_family, key_index});
// @ts-expect-error
signBytes({key_family, preimage});
// @ts-expect-error
signBytes({key_family, key_index, preimage});
// @ts-expect-error
signBytes({key_index});
// @ts-expect-error
signBytes({key_index, preimage});
// @ts-expect-error
signBytes({preimage});
// @ts-expect-error
signBytes({lnd});
// @ts-expect-error
signBytes({lnd, key_family});
// @ts-expect-error
signBytes({lnd, key_index});
// @ts-expect-error
signBytes({lnd, preimage});
// @ts-expect-error
signBytes({lnd, key_family, key_index});
// @ts-expect-error
signBytes({lnd, key_index, preimage});
// @ts-expect-error
signBytes({lnd, key_family, preimage});
// @ts-expect-error
signBytes({lnd, key_family, key_index, preimage, tag: 1});
// @ts-expect-error
signBytes({lnd, key_family, key_index, preimage, type: 'type'});

expectType<SignBytesResult>()(
  await signBytes({
    lnd,
    key_family,
    key_index,
    preimage,
  })
);

expectType<SignBytesResult>()(
  await signBytes({
    lnd,
    key_family,
    key_index,
    preimage,
    tag,
    type,
  })
);

expectType<void>()(
  signBytes({lnd, key_family, key_index, preimage}, (error, result) => {
    expectType<SignBytesResult>()(result);
  })
);
