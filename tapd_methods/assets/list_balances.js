const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const isTapd = require('./../../tapd_grpc/is_tapd');

const method = 'listBalances';
const type = 'taprootassets';

/** List Taproot Asset balances

  Requires tapd daemon with authenticated access

  {
    [asset_filter]: <Asset ID Filter Buffer>
    [group_by]: <{asset_id: Bool} | {group_key: Bool}>
    [group_key_filter]: <Group Key Filter Buffer>
    [include_leased]: <Include Leased Assets Bool>
    [script_key_type]: <Script Key Type Query Object>
    tapd: <Authenticated Tapd API Object>
  }

  @returns via cbk or Promise
  {
    [asset_balances]: [{
      asset_genesis: {
        asset_id: <Asset ID Hex String>
        asset_type: <Asset Type Number>
        genesis_point: <Genesis Point String>
        meta_hash: <Meta Hash Hex String>
        name: <Asset Name String>
        output_index: <Output Index Number>
      }
      balance: <Balance Number>
      group_key: <Group Key Hex String>
    }]
    [asset_group_balances]: [{
      balance: <Total Balance Number>
      group_key: <Group Key Hex String>
    }]
    unconfirmed_transfers: <Unconfirmed Transfer Count Number>
  }
*/
module.exports = ({tapd, asset_filter, group_by, group_key_filter, include_leased, script_key_type}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isTapd({tapd, method, type})) {
          return cbk([400, 'ExpectedAuthenticatedTapdToListAssetBalances']);
        }

        return cbk();
      },

      // List asset balances
      listBalances: ['validate', ({}, cbk) => {
        const request = {
          asset_filter,
          group_key_filter,
          include_leased,
          script_key_type,
        }

        if (group_by?.asset_id !== undefined) {
          request.asset_id = group_by.asset_id;
        } else if (group_by?.group_key !== undefined) {
          request.group_key = group_by.group_key;
        }

        return tapd[type][method](request, (err, res) => {
          if (!!err) {
            return cbk([503, 'UnexpectedErrorListingAssetBalances', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedResponseForListAssetBalancesRequest']);
          }

          return cbk(null, res);
        });
      }],

      // Format response
      balances: ['listBalances', ({listBalances}, cbk) => {
        const result = {
          unconfirmed_transfers: Number(listBalances.unconfirmed_transfers || 0),
        };

        if (listBalances.asset_balances) {
          result.asset_balances = Object.values(listBalances.asset_balances).map(balance => ({
            asset_genesis: {
              asset_id: balance.asset_genesis.asset_id.toString('hex'),
              asset_type: balance.asset_genesis.asset_type,
              genesis_point: balance.asset_genesis.genesis_point,
              meta_hash: balance.asset_genesis.meta_hash.toString('hex'),
              name: balance.asset_genesis.name,
              output_index: balance.asset_genesis.output_index,
            },
            balance: Number(balance.balance),
            group_key: balance.group_key ? balance.group_key.toString('hex') : undefined,
          }));
        }

        if (listBalances.asset_group_balances) {
          result.asset_group_balances = Object.values(listBalances.asset_group_balances).map(balance => ({
            balance: Number(balance.balance),
            group_key: balance.group_key ? balance.group_key.toString('hex') : undefined,
          }));
        }

        return cbk(null, result);
      }],
    },
    returnResult({reject, resolve, of: 'balances'}, cbk));
  });
};
