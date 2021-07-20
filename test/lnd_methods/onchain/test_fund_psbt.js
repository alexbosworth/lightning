const {test} = require('@alexbosworth/tap');

const {fundPsbt} = require('./../../../lnd_methods');

const psbt = '70736274ff01009a020000000258e87a21b56daf0c23be8e7070456c336f7cbaa5c8757924f545887bb2abdd750000000000ffffffff838d0427d0ec650a68aa46bb0b098aea4422c071b2ca78352a077959d07cea1d0100000000ffffffff0270aaf00800000000160014d85c2b71d0060b09c9886aeb815e50991dda124d00e1f5050000000016001400aea9a2e5f0f876a588df5546e8742d1d87008f000000000000000000';
const unsupported = {details: 'unknown method for service walletrpc.WalletKit'};

const makeLnd = overrides => {
  const res = {
    change_output_index: 0,
    funded_psbt: Buffer.from(psbt, 'hex'),
    locked_utxos: [{
      expiration: 1,
      id: Buffer.alloc(32),
      outpoint: {
        output_index: 0,
        txid_bytes: Buffer.from('75ddabb27b8845f5247975c8a5ba7c6f336c4570708ebe230caf6db5217ae858', 'hex').reverse(),
      },
    }],
  };

  Object.keys(overrides).forEach(k => res[k] = overrides[k]);

  return {wallet: {fundPsbt: (args, cbk) => cbk(null, res)}};
};

const makeArgs = overrides => {
  const args = {
    lnd: makeLnd({}),
    outputs: [{address: 'address', tokens: 1}],
  };

  Object.keys(overrides).forEach(key => args[key] = overrides[key]);

  return args;
};

const makeExpected = overrides => {
  const expected = {
    inputs: [
      {
        lock_expires_at: '1970-01-01T00:00:01.000Z',
        lock_id: '0000000000000000000000000000000000000000000000000000000000000000',
        transaction_id: '75ddabb27b8845f5247975c8a5ba7c6f336c4570708ebe230caf6db5217ae858',
        transaction_vout: 0,
      },
      {
        lock_expires_at: undefined,
        lock_id: undefined,
        transaction_id: '1dea7cd05979072a3578cab271c02244ea8a090bbb46aa680a65ecd027048d83',
        transaction_vout: 1,
      },
    ],
    outputs: [
      {
        is_change: true,
        output_script: '0014d85c2b71d0060b09c9886aeb815e50991dda124d',
        tokens: 149990000,
      },
      {
        is_change: false,
        output_script: '001400aea9a2e5f0f876a588df5546e8742d1d87008f',
        tokens: 100000000,
      },
    ],
    psbt: '70736274ff01009a020000000258e87a21b56daf0c23be8e7070456c336f7cbaa5c8757924f545887bb2abdd750000000000ffffffff838d0427d0ec650a68aa46bb0b098aea4422c071b2ca78352a077959d07cea1d0100000000ffffffff0270aaf00800000000160014d85c2b71d0060b09c9886aeb815e50991dda124d00e1f5050000000016001400aea9a2e5f0f876a588df5546e8742d1d87008f000000000000000000',
  };

  Object.keys(overrides).forEach(k => expected[k] = overrides[k]);

  return expected;
};

const tests = [
  {
    args: makeArgs({lnd: undefined}),
    description: 'An LND object is required',
    error: [400, 'ExpectedAuthenticatedLndToFundPsbt'],
  },
  {
    args: makeArgs({outputs: undefined}),
    description: 'An output or PSBT is required',
    error: [400, 'ExpectedEitherOutputsOrPsbtToFundPsbt'],
  },
  {
    args: makeArgs({outputs: 'outputs'}),
    description: 'Outputs are expected to be an array',
    error: [400, 'ExpectedArrayOfOutputsToFundPsbt'],
  },
  {
    args: makeArgs({psbt: 'psbt'}),
    description: 'Cannot specify both a psbt output and raw outputs',
    error: [400, 'ExpectedOnlyOutputsOrPsbtToFundPsbt'],
  },
  {
    args: makeArgs({lnd: {wallet: {fundPsbt: ({}, cbk) => cbk('err')}}}),
    description: 'Errors funding are passed back',
    error: [503, 'UnexpectedErrorFundingTransaction', {err: 'err'}],
  },
  {
    args: makeArgs({lnd: {wallet: {fundPsbt: ({}, cbk) => cbk(unsupported)}}}),
    description: 'Unsupported error is passed back',
    error: [501, 'FundPsbtMethodNotSupported'],
  },
  {
    args: makeArgs({lnd: {wallet: {fundPsbt: ({}, cbk) => cbk()}}}),
    description: 'A response is expected',
    error: [503, 'ExpectedResultOfTransactionFunding'],
  },
  {
    args: makeArgs({lnd: makeLnd({funded_psbt: undefined})}),
    description: 'A funded PSBT is expected in the response',
    error: [503, 'ExpectedFundedTransactionPsbt'],
  },
  {
    args: makeArgs({lnd: makeLnd({change_output_index: undefined})}),
    description: 'Change output index is expected in the response',
    error: [503, 'ExpectedFundingChangeOutputIndexNumber'],
  },
  {
    args: makeArgs({lnd: makeLnd({locked_utxos: undefined})}),
    description: 'Locked UTXOs are in the response',
    error: [503, 'ExpectedArrayOfUtxoLocksForFundedTransaction'],
  },
  {
    args: makeArgs({lnd: makeLnd({locked_utxos: [null]})}),
    description: 'Non empty locked UTXOs are in the response',
    error: [503, 'ExpectedNonEmptyLockedUtxosForFundedPsbt'],
  },
  {
    args: makeArgs({lnd: makeLnd({locked_utxos: [{}]})}),
    description: 'UTXOs are expected to have outpoints',
    error: [503, 'ExpectedOutpointInLockedUtxosForFundedPsbt'],
  },
  {
    args: makeArgs({lnd: makeLnd({funded_psbt: Buffer.alloc(1)})}),
    description: 'A valid PSBT is expected',
    error: [503, 'FailedToDecodePsbtInFundPsbtResponse'],
  },
  {
    args: makeArgs({}),
    description: 'PSBT funding is executed',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({min_confirmations: 0}),
    description: 'PSBT funding is executed with min confs specified',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({psbt, fee_tokens_per_vbyte: 1, outputs: undefined}),
    description: 'PSBT funding can specify fee rate and use a PSBT',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({target_confirmations: 1}),
    description: 'PSBT funding can specify conf target',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({
      inputs: [{
        transaction_id: Buffer.alloc(32).toString('hex'),
        transaction_vout: 0,
      }],
    }),
    description: 'PSBT funding can specify conf target',
    expected: makeExpected({}),
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, rejects, strictSame}) => {
    if (!!error) {
      await rejects(fundPsbt(args), error, 'Got error');
    } else {
      const got = await fundPsbt(args);

      strictSame(got, expected, 'Got expected result');
    }

    return end();
  });
});
