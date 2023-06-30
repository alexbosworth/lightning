const {deepStrictEqual} = require('node:assert').strict;
const {rejects} = require('node:assert').strict;
const test = require('node:test');

const {getChainAddresses} = require('./../../../lnd_methods');

const makeLnd = ({err, res}) => {
  return {
    wallet: {
      listAddresses: ({}, cbk) => {
        if (res !== undefined) {
          return cbk(null, res);
        }

        return cbk(err, {account_with_addresses: []});
      },
    },
  };
};

const tests = [
  {
    args: {},
    description: 'LND Object is required to get chain addresses',
    error: [400, 'ExpectedAuthenticatedLndToGetChainAddresses'],
  },
  {
    args: {lnd: makeLnd({err: 'err'})},
    description: 'LND errors are passed back',
    error: [503, 'UnexpectedErrorListingAccountAddresses', {err: 'err'}],
  },
  {
    args: {
      lnd: makeLnd({
        err: {
          details: 'unknown method ListAddresses for service walletrpc.WalletKit',
        },
      }),
    },
    description: 'Unknown method is handled',
    error: [501, 'BackingLndDoesNotSupportGettingChainAddresses'],
  },
  {
    args: {lnd: makeLnd({res: null})},
    description: 'A response is expected',
    error: [503, 'ExpectedResponseForGetAccountAddressesRequest'],
  },
  {
    args: {lnd: makeLnd({res: {}})},
    description: 'A response with accounts is expected',
    error: [503, 'ExpectedSetOfAccountAddressesInAddrsResponse'],
  },
  {
    args: {lnd: makeLnd({res: {account_with_addresses: [{}]}})},
    description: 'A valid response with accounts is expected',
    error: [503, 'ExpectedArrayOfAddressesInAccountWithAddresses'],
  },
  {
    args: {lnd: makeLnd({})},
    description: 'Get a list of chain addresses',
    expected: {addresses: []},
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async () => {
    if (!!error) {
      await rejects(() => getChainAddresses(args), error, 'Got error');
    } else {
      const res = await getChainAddresses(args);

      deepStrictEqual(res, expected, 'Got expected result');
    }

    return;
  });
});
