const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const {isArray} = Array;
const {keys} = Object;
const method = 'listPermissions';
const notSupported = /unknown/;
const type = 'default';

/** Get the list of all methods and their associated requisite permissions

  Note: this method is not supported in LND versions 0.11.1 and below

  Requires `info:read` permission

  {
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk or Promise
  {
    methods: [{
      endpoint: <Method Endpoint Path String>
      permissions: <Entity:Action String>]
    }]
  }
*/
module.exports = ({id, lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedAuthenticatedLndApiObjectToGetMethods']);
        }

        return cbk();
      },

      // Get methods and associated permissions
      getMethods: ['validate', ({}, cbk) => {
        return lnd[type][method]({}, (err, res) => {
          if (!!err && notSupported.test(err.details)) {
            return cbk([501, 'ListPermissionsMethodNotSupported']);
          }

          if (!!err) {
            return cbk([503, 'UnexpectedErrInListPermissionsResponse', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedResponseForListPermissionsRequest']);
          }

          if (!res.method_permissions) {
            return cbk([503, 'ExpectedPermissionsForListPermissionsRequest']);
          }

          const list = res.method_permissions;

          const endpoints = keys(list);

          if (!endpoints.length) {
            return cbk([503, 'ExpectedMethodsForListPermissionsRequest']);
          }

          if (endpoints.filter(n => !list[n]).length) {
            return cbk([503, 'ExpectedMethodDataForListPermissionsRequest']);
          }

          if (!!endpoints.find(n => !isArray(list[n].permissions))) {
            return cbk([503, 'ExpectedArrayOfPermissionsForMethodInList']);
          }

          const methods = endpoints.map(endpoint => {
            const permissions = list[endpoint].permissions.map(permission => {
              return `${permission.entity}:${permission.action}`;
            });

            return {endpoint, permissions};
          });

          return cbk(null, {methods});
        });
      }],
    },
    returnResult({reject, resolve, of: 'getMethods'}, cbk));
  });
};
