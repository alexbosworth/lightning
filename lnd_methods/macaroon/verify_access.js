const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const accessDeniedMessage = 'permission denied';
const asPermission = n => ({action: n.split(':')[1], entity: n.split(':')[0]});
const base64AsBuffer = base64 => Buffer.from(base64, 'base64');
const {isArray} = Array;
const isBoolean = n => n === false || n === true;
const method = 'checkMacaroonPermissions';
const notSupported = /unknown/;
const type = 'default';

/** Verify an access token has a given set of permissions

  Note: this method is not supported in LND versions 0.13.4 and below

  Requires `macaroon:read` permission

  {
    lnd: <Authenticated LND API Object>
    macaroon: <Base64 Encoded Macaroon String>
    permissions: [<Entity:Action String>]
  }

  @returns via cbk or Promise
  {
    is_valid: <Access Token is Valid For Described Permissions Bool>
  }
*/
module.exports = ({lnd, macaroon, permissions}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedAuthenticatedLndApiObjectToVerifyAccess']);
        }

        if (!macaroon) {
          return cbk([400, 'ExpectedMacaroonToVerifyAccess']);
        }

        if (!isArray(permissions)) {
          return cbk([400, 'ExpectedPermissionsArrayToVerifyAccess']);
        }

        return cbk();
      },

      // Check macaroon access
      check: ['validate', ({}, cbk) => {
        return lnd[type][method]({
          macaroon: base64AsBuffer(macaroon),
          permissions: permissions.map(permission => asPermission(permission)),
        },
        (err, res) => {
          if (!!err && notSupported.test(err.details)) {
            return cbk([501, 'VerifyAccessMethodNotSupported']);
          }

          if (!!err && err.details === accessDeniedMessage) {
            return cbk(null, {is_valid: false});
          }

          if (!!err) {
            return cbk([503, 'UnexpectedErrorFromCheckMacaroonMethod', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedResponseFromCheckMacaroonRequest']);
          }

          if (!isBoolean(res.valid)) {
            return cbk([503, 'ExpectedValidIndicatorInCheckMacaroonResponse']);
          }

          return cbk(null, {is_valid: res.valid});
        });
      }],
    },
    returnResult({reject, resolve, of: 'check'}, cbk));
  });
};
