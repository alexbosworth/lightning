const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const asRate = n => Math.floor(n * 1e6);
const method = 'getMissionControlConfig';
const notSupported = /unknown/;
const secsAsMs = n => Number(n) * 1e3;
const type = 'router';

/** Get current pathfinding settings

  Requires `offchain:read` permission

  Method not supported on LND 0.12.1 or below

  {
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk or Promise
  {
    baseline_success_rate: <Assumed Forward Fail Chance In 1 Million Number>
    max_payment_records: <Maximum Historical Payment Records To Keep Number>
    node_ignore_rate: <Avoid Node Due to Failure Rate In 1 Million Number>
    penalty_half_life_ms: <Millisecs to Reduce Fail Penalty By Half Number>
  }
*/
module.exports = ({lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedLndToGetPathfindingSettings']);
        }

        return cbk();
      },

      // Get pathfinding settings
      getSettings: ['validate', ({}, cbk) => {
        return lnd[type][method]({}, (err, res) => {
          if (!!err && notSupported.test(err.details)) {
            return cbk([501, 'GetMissionControlConfigMethodNotSupported']);
          }

          if (!!err) {
            return cbk([503, 'UnexpectedErrorGettingPathSettings', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedPathfindingSettingsResponse']);
          }

          if (!res.config) {
            return cbk([503, 'ExpectedPathfindingSettingsConfigInResponse']);
          }

          if (!res.config.half_life_seconds) {
            return cbk([503, 'ExpectedHalfLifeSecondsInSettingsResponse']);
          }

          if (res.config.hop_probability === undefined) {
            return cbk([503, 'ExpectedAssumedHopPriorityInSettingsResponse']);
          }

          if (res.config.weight === undefined) {
            return cbk([503, 'ExpectedWeightInSettingsConfigResponse']);
          }

          if (res.config.maximum_payment_results === undefined) {
            return cbk([503, 'ExpectedMaximumPaymentResultsInConfigResponse']);
          }

          return cbk(null, {
            baseline_success_rate: asRate(res.config.hop_probability),
            max_payment_records: res.config.maximum_payment_results,
            node_ignore_rate: asRate(res.config.weight),
            penalty_half_life_ms: secsAsMs(res.config.half_life_seconds),
          });
        });
      }],
    },
    returnResult({reject, resolve, of: 'getSettings'}, cbk));
  });
};
