const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const method = 'estimateFee';
const target = 6;
const type = 'wallet';
const weightPerKWeight = 1e3;
const weightPerVByte = 4;

/** Get the current minimum relay fee for the chain backend

  Requires LND built with `walletrpc` tag

  Requires `onchain:read` permission

  This method is not supported on LND 0.18.2 and below

  {
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk or Promise
  {
    tokens_per_vbyte: <Minimum Relayable Tokens Per Virtual Byte Number>
  }
*/
module.exports = (args, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({method, type, lnd: args.lnd})) {
          return cbk([400, 'ExpecteAuthenticatedLndToGetMinRelayFeeRate']);
        }

        return cbk();
      },

      // Get the minimum relayable fee rate
      getRate: ['validate', ({}, cbk) => {
        return args.lnd[type][method]({conf_target: target}, (err, res) => {
          if (!!err) {
            return cbk([503, 'UnexpectedErrorGettingMinRateFromLnd', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedResponseForMinFeeRateRequest']);
          }

          if (!res.min_relay_fee_sat_per_kw) {
            return cbk([503, 'ExpectedMinPerKwResponseForMinFeeRateRequest']);
          }

          const minPerKw = Number(res.min_relay_fee_sat_per_kw);

          const minPerVbyte = minPerKw * weightPerVByte / weightPerKWeight;

          return cbk(null, {tokens_per_vbyte: minPerVbyte});
        });
      }],
    },
    returnResult({reject, resolve, of: 'getRate'}, cbk));
  });
};
