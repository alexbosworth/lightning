const {test} = require('@alexbosworth/tap');

const {getFeeRates} = require('./../../../');

const tests = [
  {
    args: {},
    description: 'LND is expected to get fee rates',
    error: [400, 'ExpectedLndForFeeRatesRequest'],
  },
  {
    args: {lnd: {default: {feeReport: ({}, cbk) => cbk('err')}}},
    description: 'Errors are passed back from fee report',
    error: [503, 'GetFeeReportError', {err: 'err'}],
  },
  {
    args: {lnd: {default: {feeReport: ({}, cbk) => cbk()}}},
    description: 'Responses are expected for fee report',
    error: [503, 'ExpectedFeeReportResponse'],
  },
  {
    args: {lnd: {default: {feeReport: ({}, cbk) => cbk(null, {})}}},
    description: 'An array of channel fees are expected in fee report',
    error: [503, 'UnexpectedFeeReportResponse'],
  },
  {
    args: {
      lnd: {
        default: {feeReport: ({}, cbk) => cbk(null, {channel_fees: [{}]})},
      },
    },
    description: 'Fee rates are validated',
    error: [503, 'ExpectedChannelPoint'],
  },
  {
    args: {
      lnd: {
        default: {
          feeReport: ({}, cbk) => cbk(null, {
            channel_fees: [{
              base_fee_msat: '0',
              chan_id: '1',
              channel_point: `${Buffer.alloc(32).toString('hex')}:0`,
              fee_per_mil: '0',
            }],
          }),
        },
      },
    },
    description: 'Fee rates are returned for channels',
    expected: {
      channels: [{
        base_fee: 0,
        base_fee_mtokens: '0',
        fee_rate: 0,
        id: '0x0x1',
        transaction_id: Buffer.alloc(32).toString('hex'),
        transaction_vout: 0,
      }],
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, rejects, strictSame}) => {
    if (!!error) {
      await rejects(() => getFeeRates(args), error, 'Got expected error');
    } else {
      const res = await getFeeRates(args);

      strictSame(res, expected, 'Got expected result');
    }

    return end();
  });
});
