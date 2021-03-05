const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const asFloat = n => n / 1e6;
const getMethod = 'getMissionControlConfig';
const isValidRate = rate => rate === undefined || (rate >= 0 && rate <= 1e6);
const msAsSecs = ms => Math.floor(ms / 1e3);
const notSupported = /unknown/;
const setMethod = 'setMissionControlConfig';
const type = 'router';

/** Update current pathfinding settings

  Requires `offchain:read`, `offchain:write` permissions

  Method not supported on LND 0.12.1 or below

  {
    [baseline_success_rate]: <Assumed Hop Forward Chance In 1 Million Number>
    lnd: <Authenticated LND API Object>
    [max_payment_records]: <Maximum Historical Payment Records To Keep Number>
    [node_ignore_rate]: <Avoid Node Due to Failure Rate In 1 Million Number>
    [penalty_half_life_ms]: <Millisecs to Reduce Fail Penalty By Half Number>
  }

  @returns via cbk or Promise
*/
module.exports = (args, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({type, lnd: args.lnd, method: setMethod})) {
          return cbk([400, 'ExpectedLndToUpdatePathfindingSettings']);
        }

        if (!isValidRate(args.baseline_success_rate)) {
          return cbk([400, 'ExpectedValidBaselineSuccessRateForUpdate']);
        }

        if (!isValidRate(args.node_ignore_rate)) {
          return cbk([400, 'ExpectedValidIgnoreRateForPathfindingUpdate']);
        }

        return cbk();
      },

      // Get current pathfinding settings
      getSettings: ['validate', ({}, cbk) => {
        return args.lnd[type][getMethod]({}, (err, res) => {
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

          if (res.config.maximum_payment_results === undefined) {
            return cbk([503, 'ExpectedMaximumPaymentResultsInConfigResponse']);
          }

          if (!res.config.minimum_failure_relax_interval) {
            return cbk([503, 'ExpectedMinimumFailureRelaxIntervalInResponse']);
          }

          if (res.config.weight === undefined) {
            return cbk([503, 'ExpectedWeightInSettingsConfigResponse']);
          }

          const minFailureRelaxSec = res.config.minimum_failure_relax_interval;

          return cbk(null, {
            half_life_seconds: res.config.half_life_seconds,
            hop_probability: res.config.hop_probability,
            maximum_payment_results: res.config.maximum_payment_results,
            minimum_failure_relax_interval: minFailureRelaxSec,
            weight: res.config.weight,
          });
        });
      }],

      // Success half life time
      halfLifeSeconds: ['getSettings', ({getSettings}, cbk) => {
        // Exit early when not updating half life
        if (args.penalty_half_life_ms === undefined) {
          return cbk(null, getSettings.half_life_seconds);
        }

        return cbk(null, msAsSecs(args.penalty_half_life_ms));
      }],

      // Hop assumed success probability
      hopProbability: ['getSettings', ({getSettings}, cbk) => {
        // Eixt early when not updating rate
        if (args.baseline_success_rate === undefined) {
          return cbk(null, getSettings.hop_probability);
        }

        return cbk(null, asFloat(args.baseline_success_rate));
      }],

      // Maximum historical results
      maximumPaymentResults: ['getSettings', ({getSettings}, cbk) => {
        // Exit early when not updating max payment records
        if (args.max_payment_records === undefined) {
          return cbk(null, getSettings.maximum_payment_results);
        }

        return cbk(null, args.max_payment_records);
      }],

      // Weight for ignoring nodes based on past failures
      weight: ['getSettings', ({getSettings}, cbk) => {
        // Exit early when not updating ignore node weight
        if (args.node_ignore_rate === undefined) {
          return cbk(null, getSettings.weight);
        }

        return cbk(null, asFloat(args.node_ignore_rate));
      }],

      // Update settings
      update: [
        'getSettings',
        'halfLifeSeconds',
        'hopProbability',
        'maximumPaymentResults',
        'weight',
        ({
          getSettings,
          halfLifeSeconds,
          hopProbability,
          maximumPaymentResults,
          weight,
        },
        cbk) =>
      {
        const config = getSettings;

        config.half_life_seconds = halfLifeSeconds;
        config.hop_probability = hopProbability;
        config.maximum_payment_results = maximumPaymentResults;
        config.weight = weight;

        return args.lnd[type][setMethod]({config}, (err, res) => {
          if (!!err) {
            return cbk([503, 'UnexpectedErrorUpdatingPathingSettings', {err}]);
          }

          return cbk();
        });
      }],
    },
    returnResult({reject, resolve}, cbk));
  });
};
