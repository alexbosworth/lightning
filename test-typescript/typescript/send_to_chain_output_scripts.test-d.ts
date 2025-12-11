import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {
  sendToChainOutputScripts,
  SendToChainOutputScriptsArgs,
  SendToChainOutputScriptsResult,
} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

const send_to = [{script: 'script', tokens: 10}];

const description = 'desc';
const fee_tokens_per_vbyte = 10;
const utxo_confirmations = 3;

expectError(sendToChainOutputScripts());
expectError(sendToChainOutputScripts({}));
expectError(sendToChainOutputScripts({lnd}));

expectType<SendToChainOutputScriptsResult>(
  await sendToChainOutputScripts({lnd, send_to})
);
expectType<SendToChainOutputScriptsResult>(
  await sendToChainOutputScripts({
    lnd,
    send_to,
    description,
    fee_tokens_per_vbyte,
    utxo_confirmations,
  })
);

expectType<void>(
  sendToChainOutputScripts({lnd, send_to}, (error, result) => {
    expectType<SendToChainOutputScriptsResult>(result);
  })
);
expectType<void>(
  sendToChainOutputScripts(
    {lnd, send_to, description, fee_tokens_per_vbyte, utxo_confirmations},
    (error, result) => {
      expectType<SendToChainOutputScriptsResult>(result);
    }
  )
);
