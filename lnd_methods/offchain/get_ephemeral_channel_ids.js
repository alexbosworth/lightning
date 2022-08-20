const asyncAuto = require('async/auto');
const {chanFormat} = require('bolt07');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const {isArray} = Array;
const method = 'listAliases';
const notSupported = /unknown/;
const type = 'default';

/** Get ephemeral channel ids

  Requires `offchain:read` permission

  This method is not supported on LND 0.15.0 and below

  {
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk or Promise
  {
    channels: [{
      other_ids: [<Channel Identifier String>]
      reference_id: <Top Level Channel Identifier String>
    }]
  }
*/
module.exports = (args, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({method, type, lnd: args.lnd})) {
          return cbk([400, 'ExpectedAuthenticatedLndToGetChannelIds']);
        }

        return cbk();
      },

      // Get the list of channel ids
      getChannelIds: ['validate', ({}, cbk) => {
        return args.lnd[type][method]({}, (err, res) => {
          if (!!err && notSupported.test(err.details)) {
            return cbk([501, 'ListAliasesMethodNotSupported']);
          }

          if (!!err) {
            return cbk([503, 'UnexpectedGetChannelIdsError', {err}]);
          }

          if (!res || !isArray(res.alias_maps)) {
            return cbk([503, 'ExpectedChannelMapsArray']);
          }

          try {
            const channels = res.alias_maps.map(map => {
              if (!isArray(map.aliases)) {
                throw new Error('ExpectedArrayOfAliasesInAliasMap');
              }

              if (!map.base_scid) {
                throw new Error('ExpectedBaseScidInAliasMap');
              }

              const otherIds = map.aliases
                .filter(n => n !== map.base_scid)
                .map(number => chanFormat({number}).channel);

              return {
                other_ids: otherIds,
                reference_id: chanFormat({number: map.base_scid}).channel,
              };
            });

            return cbk(null, {channels});
          } catch (err) {
            return cbk([503, err.message]);
          }
        });
      }],
    },
    returnResult({reject, resolve, of: 'getChannelIds'}, cbk));
  });
};
