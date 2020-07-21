const asyncAuto = require('async/auto');
const asyncEach = require('async/each');
const asyncEachSeries = require('async/eachSeries');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const bufferFromHex = hex => Buffer.from(hex, 'hex');
const {isArray} = Array;
const isHash = n => /^[0-9A-F]{64}$/i.test(n);
const isHex = n => !!n && !(n.length % 2) && /^[0-9A-F]*$/i.test(n);
const method = 'fundingStateStep';
const type = 'default';

/** Fund pending channels

  Requires `offchain:write`, `onchain:write` permissions

  {
    channels: [<Pending Channel Id Hex String>]
    funding: <Signed Funding Transaction PSBT Hex String>
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk or Promise
*/
module.exports = ({channels, funding, lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isArray(channels)) {
          return cbk([400, 'ExpectedPendingChannelIdsToFundChannels']);
        }

        if (!channels.length) {
          return cbk([400, 'ExpectedPendingChannelIdsToFund']);
        }

        if (channels.filter(n => !n).length) {
          return cbk([400, 'ExpectedNonEmptyPendingChannelIdsToFund']);
        }

        if (!!channels.find(n => !isHash(n))) {
          return cbk([400, 'ExpectedPendingChannelIdOfChannelToFund']);
        }

        if (!isHex(funding)) {
          return cbk([400, 'ExpectedFundingPsbtToFundChannel']);
        }

        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedAuthenticatedLndToFundChannels']);
        }

        return cbk();
      },

      // Funded and signed PSBT
      psbt: ['validate', ({}, cbk) => cbk(null, bufferFromHex(funding))],

      // Verify the funding for each pending channel
      verify: ['psbt', 'validate', ({psbt}, cbk) => {
        return asyncEach(channels, (id, cbk) => {
          return lnd[type][method]({
            psbt_verify: {
              funded_psbt: psbt,
              pending_chan_id: bufferFromHex(id),
            },
          },
          err => {
            if (!!err) {
              return cbk([503, 'UnexpectedErrorValidatingChanFunding', {err}]);
            }

            return cbk();
          });
        },
        cbk);
      }],

      // Finalize the psbts
      finalize: ['psbt', 'verify', ({psbt}, cbk) => {
        const [lastChannel] = channels.slice().reverse();

        return asyncEachSeries(channels, (id, cbk) => {
          return lnd[type][method]({
            psbt_finalize: {
              no_publish: id !== lastChannel,
              pending_chan_id: bufferFromHex(id),
              signed_psbt: psbt,
            },
          },
          err => {
            if (!!err) {
              return cbk([503, 'UnexpectedErrorFinalizingChanFunding', {err}]);
            }

            return cbk();
          });
        },
        cbk);
      }],
    },
    returnResult({reject, resolve}, cbk));
  });
};
