const {strictEqual} = require('node:assert').strict;
const {rejects} = require('node:assert').strict;
const test = require('node:test');

const {getPendingSweeps} = require('./../../../lnd_methods');

const tests = [
  {
    args: {},
    description: 'LND Object is required to get pending sweeps',
    error: [400, 'ExpectedLndToGetPendingSweeps'],
  },
  {
    args: {lnd: {wallet: {pendingSweeps: ({}, cbk) => cbk('err')}}},
    description: 'Errors are passed back from method',
    error: [503, 'UnexpectedGetPendingSweepsError', {err: 'err'}],
  },
  {
    args: {lnd: {wallet: {pendingSweeps: ({}, cbk) => cbk()}}},
    description: 'A result is expected from the method',
    error: [503, 'ExpectedResponseToGetPendingSweepsRequest'],
  },
  {
    args: {lnd: {wallet: {pendingSweeps: ({}, cbk) => cbk(null, {})}}},
    description: 'An array of sweeps is expected in response',
    error: [503, 'ExpectedArrayOfPendingSweepsInSweepsResponse'],
  },
  {
    args: {
      lnd: {
        wallet: {
          pendingSweeps: ({}, cbk) => cbk(null, {pending_sweeps: [null]}),
        },
      },
    },
    description: 'An array of sweeps is expected in response',
    error: [503, 'ExpectedSweepDetailsToDerivePendingSweep'],
  },
  {
    args: {
      lnd: {
        wallet: {
          pendingSweeps: ({}, cbk) => cbk(null, {
            pending_sweeps: [{
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
            }],
          }),
        },
      },
    },
    description: 'Pending sweeps are returned',
    expected: {
      sweeps: [{
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
      }],
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async () => {
    if (!!error) {
      await rejects(() => getPendingSweeps(args), error, 'Got expected error');
    } else {
      const res = await getPendingSweeps(args);

      strictEqual(res.chain_balance, expected.chain_balance, 'Got balance');
    }

    return;
  });
});
