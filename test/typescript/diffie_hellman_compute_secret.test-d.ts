import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {
  diffieHellmanComputeSecret,
  DiffieHellmanComputeSecretResult,
} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const partner_public_key = '00';
const key_family = 0;
const key_index = 0;

expectError(diffieHellmanComputeSecret());
expectError(diffieHellmanComputeSecret({}));
expectError(diffieHellmanComputeSecret({lnd}));

expectType<DiffieHellmanComputeSecretResult>(
  await diffieHellmanComputeSecret({
    lnd,
    partner_public_key,
  })
);
expectType<DiffieHellmanComputeSecretResult>(
  await diffieHellmanComputeSecret({
    lnd,
    partner_public_key,
    key_family,
  })
);
expectType<DiffieHellmanComputeSecretResult>(
  await diffieHellmanComputeSecret({
    lnd,
    partner_public_key,
    key_index,
  })
);
expectType<DiffieHellmanComputeSecretResult>(
  await diffieHellmanComputeSecret({
    lnd,
    partner_public_key,
    key_family,
    key_index,
  })
);

expectType<void>(
  diffieHellmanComputeSecret({lnd, partner_public_key}, (error, result) => {
    expectType<DiffieHellmanComputeSecretResult>(result);
  })
);
expectType<void>(
  diffieHellmanComputeSecret(
    {lnd, partner_public_key, key_family},
    (error, result) => {
      expectType<DiffieHellmanComputeSecretResult>(result);
    }
  )
);
expectType<void>(
  diffieHellmanComputeSecret(
    {lnd, partner_public_key, key_index},
    (error, result) => {
      expectType<DiffieHellmanComputeSecretResult>(result);
    }
  )
);
expectType<void>(
  diffieHellmanComputeSecret(
    {lnd, partner_public_key, key_family, key_index},
    (error, result) => {
      expectType<DiffieHellmanComputeSecretResult>(result);
    }
  )
);
