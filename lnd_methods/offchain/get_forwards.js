const asyncAuto = require('async/auto');
const asyncify = require('async/asyncify');
const {chanFormat} = require('bolt07');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');
const {rpcForwardAsForward} = require('./../../lnd_responses');
const {sortBy} = require('./../../arrays');

const asEpoch = date => Math.round(new Date(date).getTime() / 1e3);
const defaultLimit = 100;
const {isArray} = Array;
const method = 'forwardingHistory';
const {parse} = JSON;
const {stringify} = JSON;
const type = 'default';

/** Get forwarded payments, from oldest to newest

  When using an `after` date a `before` date is required.

  If a `next` token is returned, pass it to get additional page of results.

  Requires `offchain:read` permission

  {
    [after]: <Get Only Payments Forwarded At Or After ISO 8601 Date String>
    [before]: <Get Only Payments Forwarded Before ISO 8601 Date String>
    [limit]: <Page Result Limit Number>
    lnd: <Authenticated LND API Object>
    [token]: <Opaque Paging Token String>
  }

  @returns via cbk or Promise
  {
    forwards: [{
      created_at: <Forward Record Created At ISO 8601 Date String>
      fee: <Fee Tokens Charged Number>
      fee_mtokens: <Approximated Fee Millitokens Charged String>
      incoming_channel: <Incoming Standard Format Channel Id String>
      mtokens: <Forwarded Millitokens String>
      outgoing_channel: <Outgoing Standard Format Channel Id String>
      tokens: <Forwarded Tokens Number>
    }]
    [next]: <Contine With Opaque Paging Token String>
  }
*/
module.exports = ({after, before, limit, lnd, token}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Validate arguments
      validate: cbk => {
        if (!!after && !before) {
          return cbk([400, 'ExpectedBeforeDateWhenUsingAfterDate']);
        }

        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedLndToGetForwardingHistory']);
        }

        if (!!limit && !!token) {
          return cbk([400, 'UnexpectedLimitWhenPagingForwardsWithToken']);
        }

        return cbk();
      },

      // Determine the paging details for the forwards query
      paging: ['validate', asyncify(({}) => {
        // Exit early when there is no token to derive the paging details from
        if (!token) {
          return {};
        }

        try {
          return parse(token);
        } catch (err) {
          throw [400, 'ExpectedValidPagingToken', {err}];
        }
      })],

      // Get the list of forwards
      listForwards: ['paging', ({paging}, cbk) => {
        const endTime = paging.before || before;
        const resultsLimit = paging.limit || limit || defaultLimit;
        const start = paging.after || after;

        return lnd[type][method]({
          end_time: !!endTime ? asEpoch(endTime) : undefined,
          index_offset: paging.offset || Number(),
          num_max_events: resultsLimit,
          start_time: !!start ? asEpoch(start) : undefined,
        },
        (err, res) => {
          if (!!err) {
            return cbk([503, 'GetForwardingHistoryError', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedForwardingHistoryResults']);
          }

          if (!isArray(res.forwarding_events)) {
            return cbk([503, 'ExpectedForwardingEvents']);
          }

          if (res.last_offset_index === undefined) {
            return cbk([503, 'ExpectedLastIndexOffsetInForwardsResponse']);
          }

          const token = stringify({
            after: start || undefined,
            before: endTime || undefined,
            offset: res.last_offset_index,
            limit: resultsLimit,
          });

          return cbk(null, {token, forwards: res.forwarding_events});
        });
      }],

      // Sorted forwards
      sortedForwards: ['listForwards', asyncify(({listForwards}) => {
        try {
          const forwards = sortBy({
            array: listForwards.forwards.map(rpcForwardAsForward),
            attribute: 'created_at',
          });

          return {
            forwards: forwards.sorted.reverse(),
            next: !!forwards.sorted.length ? listForwards.token : undefined,
          };
        } catch (err) {
          throw [503, err.message];
        }
      })],
    },
    returnResult({reject, resolve, of: 'sortedForwards'}, cbk));
  });
};
