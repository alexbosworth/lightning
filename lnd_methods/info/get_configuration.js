const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const asOptions = o => Object.keys(o).map(type => ({type, value: o[type]}));
const errNotFound = 'unknown method GetDebugInfo for service lnrpc.Lightning';
const {isArray} = Array;
const isIncluding = (arr, test) => arr.findIndex(test) !== -1;
const isNotString = n => typeof n !== 'string';
const method = 'getDebugInfo';
const type = 'default';
const {values} = Object;

/** Get the current configuration file settings and the output log

  Requires `info:read`, `offchain:read`, `onchain:read`, `peers:read`
  permissions

  This method is not supported on LND 0.17.5 and below

  {
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk or Promise
  {
    log: [<Log Line String>]
    options: [{
      type: <Option Type String>
      value: <Option Value String>
    }]
  }
*/
module.exports = ({lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedAuthenticatedLndGrpcForGetConfigRequest']);
        }

        return cbk();
      },

      // Get configuration info
      getInfo: ['validate', ({}, cbk) => {
        return lnd[type][method]({}, (err, res) => {
          if (!!err && err.details === errNotFound) {
            return cbk([501, 'GetDebugConfigurationInfoNotSupported']);
          }

          if (!!err) {
            return cbk([503, 'UnexpectedGetDebugInfoError', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedResponseForGetConfigurationRequest']);
          }

          if (!isArray(res.log)) {
            return cbk([503, 'ExpectedLogInConfigurationResponse']);
          }

          if (isIncluding(res.log, isNotString)) {
            return cbk([503, 'ExpectedAllLogEntriesAsStrings']);
          }

          if (!res.config) {
            return cbk([503, 'ExpectedArrayOfConfigurationOptionsInResponse']);
          }

          if (isIncluding(values(res.config), isNotString)) {
            return cbk([503, 'ExpectedAllConfigOptionsAsStrings']);
          }

          return cbk(null, {log: res.log, options: asOptions(res.config)});
        });
      }],
    },
    returnResult({reject, resolve, of: 'getInfo'}, cbk));
  });
};
