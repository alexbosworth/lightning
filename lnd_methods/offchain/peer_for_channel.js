const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {getChannel} = require('./../info');
const getChannels = require('./get_channels');

const {isArray} = Array;
const isKnownAs = (n, id) => n.id === id || n.other_ids.includes(id);
const isNotFound = err => isArray(err) && err[1] === notFoundError;
const notFoundError = 'FullChannelDetailsNotFound';

/** Get the peer at the other end of a channel of the node

  A channel is looked for in the channels of the node by its id and by its
  other ids, since a private channel can be named by an alias. Otherwise the
  channel is looked for in the graph.

  No peer is returned when the channel is not found or the node is not in it

  Requires `info:read`, `offchain:read` permissions

  {
    channel: <Standard Format Channel Id String>
    id: <Node Identity Public Key Hex String>
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk or Promise
  {
    [public_key]: <Peer Public Key Hex String>
  }
*/
module.exports = ({channel, id, lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Get the channels of the node
      getChannels: cbk => getChannels({lnd}, cbk),

      // Get the channel from the graph when it is not a channel of the node
      getChannel: ['getChannels', ({getChannels}, cbk) => {
        // Exit early when the channel is a channel of the node
        if (getChannels.channels.some(n => isKnownAs(n, channel))) {
          return cbk();
        }

        return getChannel({lnd, id: channel}, (err, res) => {
          // Exit early when the channel is not in the graph
          if (isNotFound(err)) {
            return cbk(null, {policies: []});
          }

          return cbk(err, res);
        });
      }],

      // The peer is the node at the other end of the channel
      peer: ['getChannel', 'getChannels', ({getChannel, getChannels}, cbk) => {
        const own = getChannels.channels.find(n => isKnownAs(n, channel));

        // Exit early when the channel is a channel of the node
        if (!!own) {
          return cbk(null, {public_key: own.partner_public_key});
        }

        const keys = getChannel.policies.map(n => n.public_key);

        // Exit early when the graph channel is not a channel of the node
        if (!keys.includes(id)) {
          return cbk(null, {});
        }

        return cbk(null, {public_key: keys.find(n => n !== id)});
      }],
    },
    returnResult({reject, resolve, of: 'peer'}, cbk));
  });
};
