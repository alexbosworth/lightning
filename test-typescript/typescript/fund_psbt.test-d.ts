import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {fundPsbt, FundPsbtResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

const psbt = 'psbt';
const inputs = [
  {
    transaction_id: Buffer.alloc(32).toString('hex'),
    transaction_vout: 0,
  },
];
const outputs = [{address: 'address', tokens: 1}];

// @ts-expect-error
fundPsbt();
// @ts-expect-error
fundPsbt({});
// @ts-expect-error
fundPsbt({lnd});
// @ts-expect-error
fundPsbt({lnd, psbt, outputs}); // Cannot specify both a psbt output and raw outputs

expectType<FundPsbtResult>()(await fundPsbt({lnd, psbt, inputs}));
expectType<FundPsbtResult>()(await fundPsbt({lnd, outputs, inputs}));

expectType<void>()(
  fundPsbt({lnd, psbt}, (error, result) => {
    expectType<FundPsbtResult>()(result);
  })
);
expectType<void>()(
  fundPsbt({lnd, outputs}, (error, result) => {
    expectType<FundPsbtResult>()(result);
  })
);
