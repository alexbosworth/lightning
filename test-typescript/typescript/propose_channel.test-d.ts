import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {proposeChannel} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

const capacity = 1e6;
const key_index = 0;
const id = 'id';
const partner_public_key = 'partner public key';
const remote_key = 'remote key';
const transaction_id = 'transaction id';
const transaction_vout = 0;
const args = {
  lnd,
  capacity,
  key_index,
  id,
  partner_public_key,
  remote_key,
  transaction_id,
  transaction_vout,
};

const cooperative_close_address = 'cooperative close address';
const cooperative_close_delay = 3;
const give_tokens = 1;
const is_private = true;
const argsWithOptionalProperties = {
  ...args,
  cooperative_close_address,
  cooperative_close_delay,
  give_tokens,
  is_private,
};

expectError(proposeChannel());
expectError(proposeChannel({}));

expectType<void>(await proposeChannel(args));
expectType<void>(await proposeChannel(argsWithOptionalProperties));

expectType<void>(proposeChannel(args, (error) => {}));
expectType<void>(proposeChannel(argsWithOptionalProperties, (error) => {}));
