import * as events from 'events';
import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {subscribeToChainSpend} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

const min_height = 100;
const output_script = 'a914898ffd60ad6091221250047a9f2bd6456190263487';
const bech32_address =
  'bc1qct4whle4te6qz6y7mjqxgufuvngz5h46mr6z2z3yjlpg5zvpkqyscrgp6y';
const p2pkh_address = 'p2pkh address';
const p2sh_address = '3EENzQdQS3BvvnkeJjC5uVwUKFuTczpnok';
const transaction_id = Buffer.alloc(32).toString('hex');
const transaction_vout = 0;

const args = {lnd, min_height};
const argsWithOptional = {...args, transaction_id, transaction_vout};

expectError(subscribeToChainSpend());
expectError(subscribeToChainSpend({}));
expectError(subscribeToChainSpend({lnd}));
expectError(subscribeToChainSpend({...args, output_script, bech32_address}));
expectError(subscribeToChainSpend({...args, output_script, p2pkh_address}));
expectError(subscribeToChainSpend({...args, output_script, p2sh_address}));
expectError(subscribeToChainSpend({...args, bech32_address, p2pkh_address}));
expectError(subscribeToChainSpend({...args, bech32_address, p2sh_address}));
expectError(subscribeToChainSpend({...args, p2sh_address, p2pkh_address}));

expectType<events.EventEmitter>(
  subscribeToChainSpend({...args, output_script})
);
expectType<events.EventEmitter>(
  subscribeToChainSpend({...argsWithOptional, output_script})
);
expectType<events.EventEmitter>(
  subscribeToChainSpend({...args, bech32_address})
);
expectType<events.EventEmitter>(
  subscribeToChainSpend({...argsWithOptional, bech32_address})
);
expectType<events.EventEmitter>(
  subscribeToChainSpend({...args, p2pkh_address})
);
expectType<events.EventEmitter>(
  subscribeToChainSpend({...argsWithOptional, p2pkh_address})
);
expectType<events.EventEmitter>(subscribeToChainSpend({...args, p2sh_address}));
expectType<events.EventEmitter>(
  subscribeToChainSpend({...argsWithOptional, p2sh_address})
);
