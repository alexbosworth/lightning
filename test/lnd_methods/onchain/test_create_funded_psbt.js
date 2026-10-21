const {deepStrictEqual} = require('node:assert').strict;
const {rejects} = require('node:assert').strict;
const test = require('node:test');

const {decodePsbt} = require('psbt');

const {createFundedPsbt} = require('./../../../lnd_methods');

const inTenMinutes = new Date(Date.now() + 1e3 * 60 * 10).toISOString();
const lockId = Buffer.alloc(32, 1).toString('hex');
const p2trScript = `5120${'00'.repeat(32)}`;
const p2wpkhScript = `0014${'00'.repeat(20)}`;
const psbt = '70736274ff01009a020000000258e87a21b56daf0c23be8e7070456c336f7cbaa5c8757924f545887bb2abdd750000000000ffffffff838d0427d0ec650a68aa46bb0b098aea4422c071b2ca78352a077959d07cea1d0100000000ffffffff0270aaf00800000000160014d85c2b71d0060b09c9886aeb815e50991dda124d00e1f5050000000016001400aea9a2e5f0f876a588df5546e8742d1d87008f000000000000000000';
const roundToMinute = secs => !secs ? secs : Math.round(secs / 60) * 60;
const sighashAll = 1;
const taprootDerivation = {
  fingerprint: '00000000',
  path: "m/86'/0'/0'/0/0",
  public_key: Buffer.alloc(32, 2).toString('hex'),
};
const txIds = [
  '75ddabb27b8845f5247975c8a5ba7c6f336c4570708ebe230caf6db5217ae858',
  '1dea7cd05979072a3578cab271c02244ea8a090bbb46aa680a65ecd027048d83',
];
const unsupported = {details: 'transaction template missing, need to specify either PSBT or raw TX template'};

const makeLnd = overrides => {
  const requests = [];

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

  return {
    requests,
    wallet: {
      fundPsbt: (args, cbk) => {
        const template = args.coin_select.psbt.toString('hex');

        requests.push({
          ...args,
          // The template PSBT is checked for the info added to its inputs
          coin_select: {
            ...args.coin_select,
            psbt: decodePsbt({psbt: template}).inputs,
          },
          // Lock seconds count down from now, so compare them to the minute
          lock_expiration_seconds: roundToMinute(args.lock_expiration_seconds),
        });

        return cbk(null, res);
      },
    },
  };
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
    inputs: [
      {
        lock_expires_at: '1970-01-01T00:00:01.000Z',
        lock_id: Buffer.alloc(32).toString('hex'),
        transaction_id: txIds[0],
        transaction_vout: 0,
      },
      {
        lock_expires_at: undefined,
        lock_id: undefined,
        transaction_id: txIds[1],
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

const makeRequest = overrides => {
  const request = {
    change_type: 'CHANGE_ADDRESS_TYPE_P2TR',
    coin_select: {add: true, existing_output_index: undefined, psbt: []},
    coin_selection_strategy: undefined,
    custom_lock_id: undefined,
    lock_expiration_seconds: undefined,
    max_fee_ratio: undefined,
    min_confs: undefined,
    sat_per_kw: undefined,
    sat_per_vbyte: undefined,
    spend_unconfirmed: false,
    target_conf: 6,
  };

  Object.keys(overrides).forEach(k => request[k] = overrides[k]);

  return request;
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
    args: makeArgs({lock_expires_at: '1970'}),
    description: 'A lock expiration date in the future is required',
    error: [400, 'ExpectedLaterLockExpiresAtToCreateFundedPsbt'],
  },
  {
    args: makeArgs({lock_id: '00'}),
    description: 'A lock id is required to be 32 bytes',
    error: [400, 'ExpectedHexLockIdOf32BytesToCreateFundedPsbt'],
  },
  {
    args: makeArgs({max_fee_ratio: 0}),
    description: 'A max fee ratio is required to be positive',
    error: [400, 'ExpectedPositiveMaxFeeRatioToCreateFundedPsbt'],
  },
  {
    args: makeArgs({outputs: [{script: '00', tokens: -1}]}),
    description: 'A valid PSBT template is required',
    error: [
      400,
      'FailedToCreatePsbtToFund',
      {err: 'ExpectedNonNegativeIntegerTokensForNewPsbtOutput'},
    ],
  },
  {
    args: makeArgs({
      inputs: [{
        transaction_id: txIds[0],
        transaction_vout: 0,
        witness_utxo: {output_script: '00', tokens: -1},
      }],
    }),
    description: 'A valid witness UTXO is required',
    error: [
      400,
      'FailedToCreatePsbtToFund',
      {err: 'ExpectedNonNegativeTokensForWitnessUtxoToExtendPsbt'},
    ],
  },
  {
    args: makeArgs({
      inputs: [{
        bip32_derivations: [{...taprootDerivation, fingerprint: '00'}],
        transaction_id: txIds[0],
        transaction_vout: 0,
      }],
    }),
    description: 'A valid BIP 32 derivation is required',
    error: [
      400,
      'FailedToCreatePsbtToFund',
      {err: 'ExpectedFingerprintForBip32Derivation'},
    ],
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
    args: makeArgs({lnd: makeLnd({change_output_index: undefined})}),
    description: 'A change output index is expected in the response',
    error: [503, 'ExpectedChangeIndexWhenCreatingFundedPsbt'],
  },
  {
    args: makeArgs({lnd: makeLnd({locked_utxos: undefined})}),
    description: 'Locked UTXOs are expected in the response',
    error: [503, 'ExpectedArrayOfLocksWhenCreatingFundedPsbt'],
  },
  {
    args: makeArgs({lnd: makeLnd({locked_utxos: [null]})}),
    description: 'Locked UTXOs are expected to be non-empty',
    error: [503, 'ExpectedNonEmptyLocksWhenCreatingFundedPsbt'],
  },
  {
    args: makeArgs({lnd: makeLnd({locked_utxos: [{}]})}),
    description: 'Locked UTXOs are expected to have outpoints',
    error: [503, 'ExpectedLockOutpointWhenCreatingFundedPsbt'],
  },
  {
    args: makeArgs({lnd: makeLnd({funded_psbt: Buffer.alloc(1)})}),
    description: 'A valid funded PSBT is expected in the response',
    error: [
      503,
      'FailedToDecodeFundedPsbt',
      {err: 'ExpectedKnownPsbtStartBytesToGetUnsignedTransaction'},
    ],
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
    requests: [makeRequest({sat_per_vbyte: 1, target_conf: undefined})],
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
  {
    args: makeArgs({}),
    description: 'P2TR change is added when no output is marked as change',
    expected: makeExpected({}),
    requests: [makeRequest({})],
  },
  {
    args: makeArgs({
      outputs: [
        {script: '00', tokens: 1},
        {is_change: true, script: '00', tokens: 1},
      ],
    }),
    description: 'An output marked as change is used as the change output',
    expected: makeExpected({}),
    requests: [
      makeRequest({
        coin_select: {add: undefined, existing_output_index: 1, psbt: []},
      }),
    ],
  },
  {
    args: makeArgs({fee_tokens_per_vbyte: 1.25}),
    description: 'A fractional fee rate is rounded up to a per kw fee rate',
    expected: makeExpected({}),
    requests: [makeRequest({sat_per_kw: 313, target_conf: undefined})],
  },
  {
    args: makeArgs({max_fee_ratio: 0.6}),
    description: 'A max fee ratio can be specified',
    expected: makeExpected({}),
    requests: [makeRequest({max_fee_ratio: 0.6})],
  },
  {
    args: makeArgs({lock_expires_at: inTenMinutes, lock_id: lockId}),
    description: 'A lock id and lock expiration date can be specified',
    expected: makeExpected({}),
    requests: [
      makeRequest({
        custom_lock_id: Buffer.from(lockId, 'hex'),
        lock_expiration_seconds: 600,
      }),
    ],
  },
  {
    args: makeArgs({
      inputs: [
        {transaction_id: txIds[0], transaction_vout: 0},
        {
          transaction_id: txIds[1],
          transaction_vout: 1,
          witness_utxo: {output_script: p2wpkhScript, tokens: 1e5},
        },
      ],
    }),
    description: 'A P2WPKH witness UTXO is added with a SIGHASH_ALL type',
    expected: makeExpected({}),
    requests: [
      makeRequest({
        coin_select: {
          add: true,
          existing_output_index: undefined,
          psbt: [
            {},
            {
              sighash_type: sighashAll,
              witness_utxo: {script_pub: p2wpkhScript, tokens: 1e5},
            },
          ],
        },
      }),
    ],
  },
  {
    args: makeArgs({
      inputs: [{
        bip32_derivations: [taprootDerivation],
        transaction_id: txIds[0],
        transaction_vout: 0,
        witness_utxo: {output_script: p2trScript, tokens: 1e5},
      }],
    }),
    description: 'A P2TR input gets its derivation and no sighash type',
    expected: makeExpected({}),
    requests: [
      makeRequest({
        coin_select: {
          add: true,
          existing_output_index: undefined,
          psbt: [{
            bip32_derivations: [{...taprootDerivation, leaf_hashes: []}],
            witness_utxo: {script_pub: p2trScript, tokens: 1e5},
          }],
        },
      }),
    ],
  },
  {
    args: makeArgs({
      inputs: [{transaction_id: txIds[1], transaction_vout: 1}],
    }),
    description: 'An input added to fund the PSBT is returned with its lock',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({
      lnd: makeLnd({
        locked_utxos: [{
          expiration: '1800000000',
          id: Buffer.from(lockId, 'hex'),
          outpoint: {
            output_index: 1,
            txid_bytes: Buffer.from(txIds[1], 'hex').reverse(),
          },
        }],
      }),
    }),
    description: 'Locks are returned with the inputs that they lock',
    expected: makeExpected({
      inputs: [
        {
          lock_expires_at: undefined,
          lock_id: undefined,
          transaction_id: txIds[0],
          transaction_vout: 0,
        },
        {
          lock_expires_at: '2027-01-15T08:00:00.000Z',
          lock_id: lockId,
          transaction_id: txIds[1],
          transaction_vout: 1,
        },
      ],
    }),
  },
  {
    args: makeArgs({lnd: makeLnd({change_output_index: -1})}),
    description: 'No output is change when no change output is added',
    expected: makeExpected({
      outputs: [
        {
          is_change: false,
          output_script: '0014d85c2b71d0060b09c9886aeb815e50991dda124d',
          tokens: 149990000,
        },
        {
          is_change: false,
          output_script: '001400aea9a2e5f0f876a588df5546e8742d1d87008f',
          tokens: 100000000,
        },
      ],
    }),
  },
];

tests.forEach(({args, description, error, expected, requests}) => {
  return test(description, async () => {
    if (!!error) {
      await rejects(createFundedPsbt(args), error, 'Got error');
    } else {
      const got = await createFundedPsbt(args);

      deepStrictEqual(got, expected, 'Got expected result');
    }

    if (!!requests) {
      deepStrictEqual(args.lnd.requests, requests, 'Got expected requests');
    }

    return;
  });
});
