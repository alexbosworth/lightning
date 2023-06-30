const {deepStrictEqual} = require('node:assert').strict;
const {rejects} = require('node:assert').strict;
const test = require('node:test');

const {getSettlementStatus} = require('./../../../');

const makeLnd = ({err, res}) => {
  const result = res === undefined ? {offchain: true, settled: true} : res;

  return {default: {lookupHtlcResolution: ({}, cbk) => cbk(err, result)}};
};

const makeArgs = overrides => {
  const args = {channel: '0x0x0', lnd: makeLnd({}), payment: 0};

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const tests = [
  {
    args: makeArgs({channel: undefined}),
    description: 'A channel id is required',
    error: [400, 'ExpectedChannelIdToGetSettlementStatus'],
  },
  {
    args: makeArgs({lnd: undefined}),
    description: 'LND object is required',
    error: [400, 'ExpectedLndToGetSettlementStatus'],
  },
  {
    args: makeArgs({payment: undefined}),
    description: 'A payment index is required',
    error: [400, 'ExpectedHtlcIndexToGetSettlementStatus'],
  },
  {
    args: makeArgs({lnd: makeLnd({err: {details: 'htlc unknown'}})}),
    description: 'An HTLC not found error is returned',
    error: [404, 'PaymentNotFound'],
  },
  {
    args: makeArgs({
      lnd: makeLnd({
        err: {
          details: 'unknown method LookupHtlcResolution for service lnrpc.Lightning',
        },
      }),
    }),
    description: 'A method not supported error is returned',
    error: [501, 'LookupHtlcResolutionMethodUnsupported'],
  },
  {
    args: makeArgs({
      lnd: makeLnd({
        err: {
          details: 'cannot lookup with flag --store-final-htlc-resolutions=false',
        },
      }),
    }),
    description: 'A method not supported error is returned',
    error: [404, 'LookupHtlcResolutionMethodUninitiated'],
  },
  {
    args: makeArgs({lnd: makeLnd({err: 'err'})}),
    description: 'A generic error is returned',
    error: [503, 'UnexpectedLookupHltcError', {err: 'err'}],
  },
  {
    args: makeArgs({lnd: makeLnd({res: null})}),
    description: 'A response is expected',
    error: [503, 'ExpectedHtlcLookupResponse'],
  },
  {
    args: makeArgs({lnd: makeLnd({res: {}})}),
    description: 'A chain status is expected',
    error: [503, 'ExpectedOffchainStatusInHtlcLookupResponse'],
  },
  {
    args: makeArgs({lnd: makeLnd({res: {offchain: true}})}),
    description: 'A settlement status is expected',
    error: [503, 'ExpectedSettledStatusInHtlcLookupResponse'],
  },
  {
    args: makeArgs({}),
    description: 'Settlement status is returned',
    expected: {is_onchain: false, is_settled: true},
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async () => {
    if (!!error) {
      await rejects(getSettlementStatus(args), error, 'Got expected error');
    } else {
      const res = await getSettlementStatus(args);

      deepStrictEqual(res, expected, 'Got expected result');
    }

    return;
  });
});
