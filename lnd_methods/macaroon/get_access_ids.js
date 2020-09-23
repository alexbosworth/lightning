const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const {isArray} = Array;
const method = 'listMacaroonIDs';
const notSupported = /unknown/;
const type = 'default';

/** Get outstanding access ids given out

  Note: this method is not supported in LND versions 0.11.1 and below

  Requires `macaroon:read` permission

  {
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk or Promise
  {
    ids: [<Root Access Id Number>]
  }
*/
module.exports = ({id, lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedAuthenticatedLndApiObjectToGetAccessIds']);
        }

        return cbk();
      },

      // Get access ids
      getIds: ['validate', ({}, cbk) => {
        return lnd[type][method]({}, (err, res) => {
          if (!!err && notSupported.test(err.details)) {
            return cbk([501, 'ListRootMacaroonIdsMethodNotSupported']);
          }

          if (!!err) {
            return cbk([503, 'UnexpectedErrorInListRootIdsResponse', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedResponseForListMacaroonRootIdsRequest']);
          }

          if (!isArray(res.root_key_ids)) {
            return cbk([503, 'ExpectedArrayOfRootKeyIdsInListIdsResponse']);
          }

          if (!!res.root_key_ids.filter(n => !n).length) {
            return cbk([503, 'UnexpectedEmptyMacarootRootIdInListResponse']);
          }

          return cbk(null, {ids: res.root_key_ids});
        });
      }],
    },
    returnResult({reject, resolve, of: 'getIds'}, cbk));
  });
};
