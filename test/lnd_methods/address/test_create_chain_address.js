const {test} = require('@alexbosworth/tap');

const {createChainAddress} = require('./../../../');

const tests = [
  {
    args: {format: 'foo'},
    description: 'A known address format is required',
    error: [400, 'ExpectedKnownAddressFormat'],
  },
  {
    args: {format: 'p2wpkh'},
    description: 'LND is required',
    error: [400, 'ExpectedLndForAddressCreation'],
  },
  {
    args: {format: 'p2wpkh', lnd: {}},
    description: 'LND with default is required',
    error: [400, 'ExpectedLndForAddressCreation'],
  },
  {
    args: {format: 'p2wpkh', lnd: {default: {}}},
    description: 'LND with default is required',
    error: [400, 'ExpectedLndForAddressCreation'],
  },
  {
    args: {
      format: 'p2wpkh',
      lnd: {
        default: {
          newAddress: ({}, cbk) => cbk({
            message: '14 UNAVAILABLE: Connect Failed',
          }),
        },
      },
    },
    description: 'Connection failure error is returned',
    error: [503, 'FailedToConnectToDaemonToCreateChainAddress'],
  },
  {
    args: {
      format: 'p2wpkh',
      lnd: {default: {newAddress: ({}, cbk) => cbk('err')}},
    },
    description: 'Unanticipated errors are returned',
    error: [503, 'UnexpectedErrorCreatingAddress', {err: 'err'}],
  },
  {
    args: {format: 'p2wpkh', lnd: {default: {newAddress: ({}, cbk) => cbk()}}},
    description: 'A result is required',
    error: [503, 'ExpectedResponseForAddressCreation'],
  },
  {
    args: {
      format: 'p2wpkh',
      lnd: {default: {newAddress: ({}, cbk) => cbk(null, {})}},
    },
    description: 'An address is required',
    error: [503, 'ExpectedAddressInCreateAddressResponse'],
  },
  {
    args: {
      format: 'p2wpkh',
      lnd: {default: {newAddress: ({}, cbk) => cbk(null, {address: 'addr'})}},
    },
    description: 'An address is required',
    expected: {address: 'addr'},
  },
  {
    args: {
      lnd: {default: {newAddress: ({}, cbk) => cbk(null, {address: 'addr'})}},
    },
    description: 'The default address is p2wpkh',
    expected: {address: 'addr'},
  },
  {
    args: {
      format: 'p2tr',
      lnd: {
        default: {
          newAddress: ({}, cbk) => cbk(null, {address: 'addr'}),
        },
        wallet: {
          listAccounts: ({}, cbk) => cbk({
            details: 'unknown.service.walletrpc.WalletKit',
          }),
        },
      },
    },
    description: 'Taproot requires TR account',
    error: [501, 'CreationOfTaprootAddressesUnsupported'],
  },
  {
    args: {
      format: 'p2tr',
      lnd: {
        default: {newAddress: ({}, cbk) => cbk(null, {address: 'addr'})},
        wallet: {listAccounts: ({}, cbk) => cbk('err')},
      },
    },
    description: 'Taproot check errors are passed back',
    error: [503, 'UnexpectedErrorCheckingTaprootSupport'],
  },
  {
    args: {
      format: 'p2tr',
      lnd: {
        default: {newAddress: ({}, cbk) => cbk(null, {address: 'addr'})},
        wallet: {listAccounts: ({}, cbk) => cbk()},
      },
    },
    description: 'Taproot requires account result',
    error: [503, 'ExpectedResultForDerivationPathsRequest'],
  },
  {
    args: {
      format: 'p2tr',
      lnd: {
        default: {newAddress: ({}, cbk) => cbk(null, {address: 'addr'})},
        wallet: {listAccounts: ({}, cbk) => cbk(null, {})},
      },
    },
    description: 'Taproot accounts are expected',
    error: [503, 'ExpectedAccountsInDerivationPathsResult'],
  },
  {
    args: {
      format: 'p2tr',
      lnd: {
        default: {newAddress: ({}, cbk) => cbk(null, {address: 'addr'})},
        wallet: {listAccounts: ({}, cbk) => cbk(null, {accounts: []})},
      },
    },
    description: 'Taproot supporting account is expected',
    error: [501, 'ExpectedTaprootSupportingLndToCreateAddress'],
  },
  {
    args: {
      format: 'p2tr',
      lnd: {
        default: {
          newAddress: ({}, cbk) => cbk(null, {
            address: 'taproot_address',
          }),
        },
        wallet: {
          listAccounts: ({}, cbk) => cbk(null, {
            accounts: [{address_type: 'TAPROOT_PUBKEY'}],
          }),
        },
      },
    },
    description: 'Taproot supporting account',
    expected: {address: 'taproot_address'},
  },
  {
    args: {
      format: 'p2wpkh',
      is_unused: true,
      lnd: {
        default: {
          newAddress: (args, cbk) => {
            if (args.type !== 2) {
              return cbk([500, 'FailedToSetUnusedFlagForAddress', args.type]);
            }

            return cbk(null, {address: 'addr'});
          },
        },
      },
    },
    description: 'An unused address gets an unused address',
    expected: {address: 'addr'},
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({deepEqual, end, equal, rejects}) => {
    if (!!error) {
      rejects(() => createChainAddress(args), error, 'Got expected error');
    } else {
      const {address} = await createChainAddress(args);

      equal(address, expected.address, 'Got expected new address');
    }

    return end();
  });
});
