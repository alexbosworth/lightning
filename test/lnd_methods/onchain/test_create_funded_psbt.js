const {deepStrictEqual} = require('node:assert').strict;
const {rejects} = require('node:assert').strict;
const test = require('node:test');

const {createFundedPsbt} = require('./../../../lnd_methods');

const psbt = '70736274ff01009a020000000258e87a21b56daf0c23be8e7070456c336f7cbaa5c8757924f545887bb2abdd750000000000ffffffff838d0427d0ec650a68aa46bb0b098aea4422c071b2ca78352a077959d07cea1d0100000000ffffffff0270aaf00800000000160014d85c2b71d0060b09c9886aeb815e50991dda124d00e1f5050000000016001400aea9a2e5f0f876a588df5546e8742d1d87008f000000000000000000';
const unsupported = {details: 'transaction template missing, need to specify either PSBT or raw TX template'};

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
    outputs: [{script: '00', tokens: 1}],
  };

  Object.keys(overrides).forEach(key => args[key] = overrides[key]);

  return args;
};

const makeExpected = overrides => {
  const expected = {
    psbt: '70736274ff01009a020000000258e87a21b56daf0c23be8e7070456c336f7cbaa5c8757924f545887bb2abdd750000000000ffffffff838d0427d0ec650a68aa46bb0b098aea4422c071b2ca78352a077959d07cea1d0100000000ffffffff0270aaf00800000000160014d85c2b71d0060b09c9886aeb815e50991dda124d00e1f5050000000016001400aea9a2e5f0f876a588df5546e8742d1d87008f000000000000000000',
  };

  Object.keys(overrides).forEach(k => expected[k] = overrides[k]);

  return expected;
};

const tests = [
  {
    args: makeArgs({change_format: 'change_format'}),
    description: 'A valid change format is required',
    error: [400, 'ExpectedKnownChangeFormatToFundPsbt'],
  },
  {
    args: makeArgs({lnd: undefined}),
    description: 'An LND object is required',
    error: [400, 'ExpectedAuthenticatedLndToCreateFundedPsbt'],
  },
  {
    args: makeArgs({lnd: {wallet: {fundPsbt: ({}, cbk) => cbk(unsupported)}}}),
    description: 'Unsupported error is passed back',
    error: [501, 'CreateFundedPsbtMethodNotSupported'],
  },
  {
    args: makeArgs({lnd: {wallet: {fundPsbt: ({}, cbk) => cbk('err')}}}),
    description: 'Errors funding are passed back',
    error: [503, 'UnexpectedErrorCreatingFundedPsbt', {err: 'err'}],
  },
  {
    args: makeArgs({lnd: {wallet: {fundPsbt: ({}, cbk) => cbk()}}}),
    description: 'A response is expected',
    error: [503, 'ExpectedResultWhenCreatingFundedPsbt'],
  },
  {
    args: makeArgs({lnd: makeLnd({funded_psbt: undefined})}),
    description: 'A funded PSBT is expected in the response',
    error: [503, 'ExpectedFundedTransactionPsbtToBeCreated'],
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
    args: makeArgs({fee_tokens_per_vbyte: 1, outputs: undefined}),
    description: 'PSBT funding can specify fee rate',
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
    description: 'Inputs can be specified',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({outputs: [{is_change: true, script: '00', tokens: 1}]}),
    description: 'Outputs can be specified',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({utxo_selection: 'largest'}),
    description: 'PSBT funding can select largest coins',
    expected: makeExpected({}),
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async () => {
    if (!!error) {
      await rejects(createFundedPsbt(args), error, 'Got error');
    } else {
      const got = await createFundedPsbt(args);

      deepStrictEqual(got, expected, 'Got expected result');
    }

    return;
  });
});
