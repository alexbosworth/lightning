const {deepEqual} = require('node:assert').strict;
const test = require('node:test');
const {throws} = require('node:assert').strict;

const {rpcSweepAsSweep} = require('./../../lnd_responses');

const makeArgs = overrides => {
  const response = {
    amount_sat: 0,
    broadcast_attempts: 0,
    budget: '0',
    deadline_height: 0,
    immediate: true,
    outpoint: {
      output_index: 0,
      txid_str: Buffer.alloc(32).toString('hex'),
    },
    requested_sat_per_vbyte: '0',
    sat_per_vbyte: '0',
    witness_type: 'witness_type',
  };

  Object.keys(overrides || {}).forEach(key => response[key] = overrides[key]);

  return response;
};


const makeExpected = overrides => {
  const expected = {
    broadcasts_count: 0,
    current_fee_rate: undefined,
    initial_fee_rate: undefined,
    is_batching: false,
    max_fee: undefined,
    max_height: undefined,
    tokens: 0,
    transaction_id: Buffer.alloc(32).toString('hex'),
    transaction_vout: 0,
    type: 'witness_type',
  };

  Object.keys(overrides || {}).forEach(key => expected[key] = overrides[key]);

  return expected;
};

const tests = [
  {
    description: 'Pending sweep details are expected',
    error: 'ExpectedSweepDetailsToDerivePendingSweep',
  },
  {
    args: makeArgs({amount_sat: undefined}),
    description: 'The sweep amount is expected',
    error: 'ExpectedSweepOutpointValueAmountInPendingSweep',
  },
  {
    args: makeArgs({broadcast_attempts: undefined}),
    description: 'The broadcasts count is expected',
    error: 'ExpectedBroadcastAttemptsForSweepInPendingSweep',
  },
  {
    args: makeArgs({budget: undefined}),
    description: 'The sweep budget is expected',
    error: 'ExpectedSweepBudgetAmountForSweepInPendingSweeps',
  },
  {
    args: makeArgs({deadline_height: undefined}),
    description: 'The target deadline is expected',
    error: 'ExpectedSweepConfirmationDeadlineHeightInPendingSweep',
  },
  {
    args: makeArgs({immediate: undefined}),
    description: 'The immediate status is expected',
    error: 'ExpectedImmediateStatusOfSweepInPendingSweeps',
  },
  {
    args: makeArgs({outpoint: undefined}),
    description: 'The outpoint being swept is expected',
    error: 'ExpectedUnspentOutpointOfSweepInPendingSweeps',
  },
  {
    args: makeArgs({outpoint: {}}),
    description: 'The outpoint vout being swept is expected',
    error: 'ExpectedOutputIndexOfSweepInPendingSweeps',
  },
  {
    args: makeArgs({outpoint: {output_index: 0}}),
    description: 'The outpoint transaction id being swept is expected',
    error: 'ExpectedOutpointTransactionIdHexStringInSweep',
  },
  {
    args: makeArgs({requested_sat_per_vbyte: undefined}),
    description: 'The requested sweeping chain fee rate is expected',
    error: 'ExpectedRequestedSatPerVByteForSweepInPendingSweeps',
  },
  {
    args: makeArgs({sat_per_vbyte: undefined}),
    description: 'The sweeping chain fee rate is expected',
    error: 'ExpectedSatPerVByteForSweepInPendingSweeps',
  },
  {
    args: makeArgs({}),
    description: 'RPC sweep is mapped to pending sweep details',
    expected: makeExpected({}),
  },
  {
    args: makeArgs({
      budget: '1',
      deadline_height: 1,
      requested_sat_per_vbyte: '1',
      sat_per_vbyte: '1',
    }),
    description: 'RPC sweep with all details is mapped to pending sweep ',
    expected: makeExpected({
      current_fee_rate: 1,
      initial_fee_rate: 1,
      max_fee: 1,
      max_height: 1,
    }),
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, (t, end) => {
    if (!!error) {
      throws(() => rpcSweepAsSweep(args), new Error(error), 'Got err');
    } else {
      deepEqual(rpcSweepAsSweep(args), expected, 'RPC sweep mapped');
    }

    return end();
  });
});
