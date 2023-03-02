const asyncAuto = require('async/auto');
const {chanNumber} = require('bolt07');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const errorNotFound = 'htlc unknown';
const errorUninitiated = 'cannot lookup with flag --store-final-htlc-resolutions=false';
const errorUnimplemented = 'unknown method LookupHtlcResolution for service lnrpc.Lightning';
const isBoolean = n => n === false || n === true;
const method = 'lookupHtlcResolution';
const type = 'default';

/** Get the settlement status of a received HTLC

  Note: this method is not supported in LND versions 0.15.5 and below

  Requires LND running with `--store-final-htlc-resolutions` flag

  Requires `offchain:read` permissions

  {
    channel: <Standard Format Channel Id String>
    lnd: <Authenticated LND API Object>
    payment: <Payment Id Number>
  }

  @returns via cbk or Promise
  {
    is_onchain: <Payment Went to Chain Bool>
    is_settled: <Payment Is Settled Into Non-HTLC Balance Bool>
  }
*/
module.exports = ({channel, lnd, payment}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!channel) {
          return cbk([400, 'ExpectedChannelIdToGetSettlementStatus']);
        }

        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedLndToGetSettlementStatus']);
        }

        if (payment === undefined) {
          return cbk([400, 'ExpectedHtlcIndexToGetSettlementStatus']);
        }

        return cbk();
      },

      // Get the settlement status of an HTLC
      getStatus: ['validate', ({}, cbk) => {
        return lnd[type][method]({
          chan_id: chanNumber({channel}).number,
          htlc_index: payment.toString(),
        },
        (err, res) => {
          if (!!err && err.details === errorNotFound) {
            return cbk([404, 'PaymentNotFound']);
          }

          if (!!err && err.details === errorUnimplemented) {
            return cbk([501, 'LookupHtlcResolutionMethodUnsupported']);
          }

          if (!!err && err.details == errorUninitiated) {
            return cbk([404, 'LookupHtlcResolutionMethodUninitiated']);
          }

          if (!!err) {
            return cbk([503, 'UnexpectedLookupHltcError', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedHtlcLookupResponse']);
          }

          if (!isBoolean(res.offchain)) {
            return cbk([503, 'ExpectedOffchainStatusInHtlcLookupResponse']);
          }

          if (!isBoolean(res.settled)) {
            return cbk([503, 'ExpectedSettledStatusInHtlcLookupResponse']);
          }

          return cbk(null, {
            is_onchain: !res.offchain,
            is_settled: res.settled,
          });
        });
      }],
    },
    returnResult({reject, resolve, of: 'getStatus'}, cbk));
  });
};
