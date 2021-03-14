import {expectError, expectType} from 'tsd';
import * as ws from 'ws';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {sendToChainAddress, SendToChainAddressResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

const address = 'address';
const tokens = 1;

const wss = [new ws.Server()];
const log = console.log;
const description = 'description';
const fee_tokens_per_vbyte = 1;
const target_confirmations = 1;
const utxo_confirmations = 1;

const args = {lnd, address, tokens};
const argsWithSendAll = {lnd, address, is_send_all: true} as const;
const argsWithWss = {...args, wss, log};
const argsWithOptional = {
  ...argsWithWss,
  description,
  fee_tokens_per_vbyte,
  target_confirmations,
  utxo_confirmations,
};

expectError(sendToChainAddress());
expectError(sendToChainAddress({}));
expectError(sendToChainAddress({lnd}));
expectError(sendToChainAddress({lnd, address}));
expectError(sendToChainAddress({lnd, tokens}));
expectError(sendToChainAddress({lnd, is_send_all: true}));
expectError(sendToChainAddress({lnd, address, tokens, is_send_all: true})); // Expected either send all or tokens to send to chain address
expectError(sendToChainAddress({lnd, address, tokens, wss})); // A log method is expected to send to chain address

expectType<SendToChainAddressResult>(await sendToChainAddress(args));
expectType<SendToChainAddressResult>(await sendToChainAddress(argsWithSendAll));
expectType<SendToChainAddressResult>(await sendToChainAddress(argsWithWss));
expectType<SendToChainAddressResult>(
  await sendToChainAddress(argsWithOptional)
);

expectType<void>(
  sendToChainAddress(args, (error, result) => {
    expectType<SendToChainAddressResult>(result);
  })
);
expectType<void>(
  sendToChainAddress(argsWithSendAll, (error, result) => {
    expectType<SendToChainAddressResult>(result);
  })
);
expectType<void>(
  sendToChainAddress(argsWithWss, (error, result) => {
    expectType<SendToChainAddressResult>(result);
  })
);
expectType<void>(
  sendToChainAddress(argsWithOptional, (error, result) => {
    expectType<SendToChainAddressResult>(result);
  })
);
