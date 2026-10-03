import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {
  scriptFromChainAddress,
  ScriptFromChainAddressResult,
} from '../../lnd_methods/onchain/script_from_chain_address';

const bech32_address =
  'bc1qct4whle4te6qz6y7mjqxgufuvngz5h46mr6z2z3yjlpg5zvpkqyscrgp6y';
const p2pkh_address = '1Cak4mhFsBG3X8xtqSnZsAHWzhUWTW31bR';
const p2sh_address = '3EENzQdQS3BvvnkeJjC5uVwUKFuTczpnok';

// @ts-expect-error
scriptFromChainAddress();
// @ts-expect-error
scriptFromChainAddress({});
// @ts-expect-error
scriptFromChainAddress({bech32_address, p2pkh_address});
// @ts-expect-error
scriptFromChainAddress({bech32_address, p2sh_address});
// @ts-expect-error
scriptFromChainAddress({p2pkh_address, p2sh_address});
// @ts-expect-error
scriptFromChainAddress({bech32_address, p2pkh_address, p2sh_address});

expectType<ScriptFromChainAddressResult>()(
  scriptFromChainAddress({bech32_address})
);
expectType<ScriptFromChainAddressResult>()(
  scriptFromChainAddress({p2pkh_address})
);
expectType<ScriptFromChainAddressResult>()(
  scriptFromChainAddress({p2sh_address})
);
