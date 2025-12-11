import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {createChainAddress, CreateChainAddressResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const np2wpkh = 'np2wpkh';
const p2wpkh = 'p2wpkh';

expectError(createChainAddress());
expectError(createChainAddress({}));
expectError(createChainAddress({lnd, format: 'invalidFormat'}));

expectType<CreateChainAddressResult>(await createChainAddress({lnd}));
expectType<CreateChainAddressResult>(
  await createChainAddress({lnd, format: np2wpkh})
);
expectType<CreateChainAddressResult>(
  await createChainAddress({lnd, format: p2wpkh})
);

expectType<void>(
  createChainAddress({lnd}, (error, result) => {
    expectType<CreateChainAddressResult>(result);
  })
);
expectType<void>(
  createChainAddress({lnd, format: np2wpkh}, (error, result) => {
    expectType<CreateChainAddressResult>(result);
  })
);
expectType<void>(
  createChainAddress({lnd, format: p2wpkh}, (error, result) => {
    expectType<CreateChainAddressResult>(result);
  })
);
