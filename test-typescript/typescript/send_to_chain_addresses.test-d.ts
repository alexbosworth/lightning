import {expectError, expectType} from 'tsd';
import * as ws from 'ws';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {
  sendToChainAddresses,
  SendToChainAddressesResult,
} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

const address = 'address';
const tokens = 1;
const send_to = [{address, tokens}];

const wss = [new ws.Server()];
const log = console.log;
const description = 'description';
const fee_tokens_per_vbyte = 1;
const target_confirmations = 1;
const utxo_confirmations = 1;

const args = {lnd, send_to};
const argsWithWss = {...args, wss, log};
const argsWithOptional = {
  ...argsWithWss,
  description,
  fee_tokens_per_vbyte,
  target_confirmations,
  utxo_confirmations,
};

expectError(sendToChainAddresses());
expectError(sendToChainAddresses({}));
expectError(sendToChainAddresses({lnd}));
expectError(sendToChainAddresses({lnd, send_to, wss})); // A log method is expected to send to chain address

expectType<SendToChainAddressesResult>(await sendToChainAddresses(args));
expectType<SendToChainAddressesResult>(await sendToChainAddresses(argsWithWss));
expectType<SendToChainAddressesResult>(
  await sendToChainAddresses(argsWithOptional)
);

expectType<void>(
  sendToChainAddresses(args, (error, result) => {
    expectType<SendToChainAddressesResult>(result);
  })
);
expectType<void>(
  sendToChainAddresses(argsWithWss, (error, result) => {
    expectType<SendToChainAddressesResult>(result);
  })
);
expectType<void>(
  sendToChainAddresses(argsWithOptional, (error, result) => {
    expectType<SendToChainAddressesResult>(result);
  })
);
