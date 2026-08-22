const {strictEqual} = require('node:assert').strict;
const {rejects} = require('node:assert').strict;
const test = require('node:test');

const {listTaprootAssetBalances} = require('./../../../tapd_methods/assets');

const makeTapd = overrides => {
  const tapd = {
    taprootassets: {
      listBalances: ({}, cbk) => {
        return cbk(null, {
          asset_balances: {
            'asset1': {
              asset_genesis: {
                asset_id: Buffer.from('01'.repeat(32), 'hex'),
                asset_type: 0,
                genesis_point: '00:1',
                meta_hash: Buffer.from('02'.repeat(32), 'hex'),
                name: 'TestAsset',
                output_index: 0,
              },
              balance: '1000',
              group_key: Buffer.from('03'.repeat(33), 'hex'),
            },
          },
          asset_group_balances: {
            'group1': {
              balance: '2000',
              group_key: Buffer.from('04'.repeat(33), 'hex'),
            },
          },
          unconfirmed_transfers: '5',
        });
      },
    },
  };

  Object.keys(overrides || {}).forEach(key => {
    if (key === 'taprootassets') {
      Object.keys(overrides[key]).forEach(method => {
        tapd.taprootassets[method] = overrides[key][method];
      });
    } else {
      tapd[key] = overrides[key];
    }
  });

  return tapd;
};

const tests = [
  {
    args: {},
    description: 'Tapd object is required to list asset balances',
    error: [400, 'ExpectedAuthenticatedTapdToListAssetBalances'],
  },
  {
    args: {tapd: {taprootassets: {listBalances: ({}, cbk) => cbk('err')}}},
    description: 'Errors are passed back from list balances method',
    error: [503, 'UnexpectedErrorListingAssetBalances', {err: 'err'}],
  },
  {
    args: {tapd: {taprootassets: {listBalances: ({}, cbk) => cbk()}}},
    description: 'A result is expected from the list balances method',
    error: [503, 'ExpectedResponseForListAssetBalancesRequest'],
  },
  {
    args: {tapd: makeTapd()},
    description: 'Asset balances are returned',
    expected: {
      asset_balances: [{
        asset_genesis: {
          asset_id: '01'.repeat(32),
          asset_type: 0,
          genesis_point: '00:1',
          meta_hash: '02'.repeat(32),
          name: 'TestAsset',
          output_index: 0,
        },
        balance: 1000,
        group_key: '03'.repeat(33),
      }],
      asset_group_balances: [{
        balance: 2000,
        group_key: '04'.repeat(33),
      }],
      unconfirmed_transfers: 5,
    },
  },
  {
    args: {
      tapd: makeTapd(),
      group_by: {asset_id: true},
    },
    description: 'Group by asset id parameter is passed through',
    expected: {
      asset_balances: [{
        asset_genesis: {
          asset_id: '01'.repeat(32),
          asset_type: 0,
          genesis_point: '00:1',
          meta_hash: '02'.repeat(32),
          name: 'TestAsset',
          output_index: 0,
        },
        balance: 1000,
        group_key: '03'.repeat(33),
      }],
      asset_group_balances: [{
        balance: 2000,
        group_key: '04'.repeat(33),
      }],
      unconfirmed_transfers: 5,
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async () => {
    if (!!error) {
      await rejects(() => listTaprootAssetBalances(args), error, 'Got expected error');
    } else {
      const res = await listTaprootAssetBalances(args);

      if (expected.asset_balances) {
        strictEqual(res.asset_balances.length, expected.asset_balances.length, 'Got asset balances');
        strictEqual(res.asset_balances[0].balance, expected.asset_balances[0].balance, 'Got balance');
        strictEqual(res.asset_balances[0].asset_genesis.asset_id, expected.asset_balances[0].asset_genesis.asset_id, 'Got asset id');
      }

      if (expected.asset_group_balances) {
        strictEqual(res.asset_group_balances.length, expected.asset_group_balances.length, 'Got group balances');
        strictEqual(res.asset_group_balances[0].balance, expected.asset_group_balances[0].balance, 'Got group balance');
      }

      strictEqual(res.unconfirmed_transfers, expected.unconfirmed_transfers, 'Got unconfirmed transfers');
    }

    return;
  });
});
