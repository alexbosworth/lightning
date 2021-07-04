const asyncAuto = require('async/auto');
const asyncMapLimit = require('async/mapLimit');
const {featureFlagDetails} = require('bolt09');
const {returnResult} = require('asyncjs-util');

const {nodeInfoAsNode} = require('./../../lnd_responses');
const getChannel = require('./get_channel');
const {isLnd} = require('./../../lnd_requests');
const getWalletVersion = require('./get_wallet_version');

const badVers = ['0.11.0-beta', '0.11.1-beta', '0.12.0-beta', '0.12.1-beta'];
const colorTemplate = '#000000';
const getChannelLimit = 20;
const {isArray} = Array;
const {keys} = Object;
const method = 'getNodeInfo';
const msPerSec = 1e3;
const nodeNotFoundError = 'unable to find node';
const type = 'default';

/** Get information about a node

  Requires `info:read` permission

  {
    [is_omitting_channels]: <Omit Channels from Node Bool>
    lnd: <Authenticated LND API Object>
    public_key: <Node Public Key Hex String>
  }

  @returns via cbk or Promise
  {
    alias: <Node Alias String>
    capacity: <Node Total Capacity Tokens Number>
    channel_count: <Known Node Channels Number>
    channels: [{
      capacity: <Maximum Tokens Number>
      id: <Standard Format Channel Id String>
      policies: [{
        [base_fee_mtokens]: <Base Fee Millitokens String>
        [cltv_delta]: <Locktime Delta Number>
        [fee_rate]: <Fees Charged in Millitokens Per Million Number>
        [is_disabled]: <Channel Is Disabled Bool>
        [max_htlc_mtokens]: <Maximum HTLC Millitokens Value String>
        [min_htlc_mtokens]: <Minimum HTLC Millitokens Value String>
        public_key: <Node Public Key String>
        [updated_at]: <Policy Last Updated At ISO 8601 Date String>
      }]
      transaction_id: <Transaction Id Hex String>
      transaction_vout: <Transaction Output Index Number>
      [updated_at]: <Policy Last Updated At ISO 8601 Date String>
    }]
    color: <RGB Hex Color String>
    features: [{
      bit: <BOLT 09 Feature Bit Number>
      is_known: <Feature is Known Bool>
      is_required: <Feature Support is Required Bool>
      type: <Feature Type String>
    }]
    sockets: [{
      socket: <Host and Port String>
      type: <Socket Type String>
    }]
    [updated_at]: <Last Known Update ISO 8601 Date String>
  }
*/
module.exports = (args, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({method, type, lnd: args.lnd})) {
          return cbk([400, 'ExpectedLndApiObjectToGetNodeInfo']);
        }

        if (!args.public_key) {
          return cbk([400, 'ExpectedPublicKeyForNodeInfo']);
        }

        return cbk();
      },

      // Get node
      getNode: ['validate', ({}, cbk) => {
        return args.lnd[type][method]({
          include_channels: !args.is_omitting_channels,
          pub_key: args.public_key,
        },
        (err, res) => {
          if (!!err && err.details === nodeNotFoundError) {
            return cbk([404, 'NodeIsUnknown']);
          }

          if (!!err) {
            return cbk([503, 'FailedToRetrieveNodeDetails', {err}]);
          }

          try {
            return cbk(null, nodeInfoAsNode(res));
          } catch (err) {
            return cbk([503, err.message]);
          }
        });
      }],

      // Get version
      getVersion: ['validate', ({}, cbk) => {
        return getWalletVersion({lnd: args.lnd}, (err, res) => {
          // Ignore errors on wallet version
          if (!!err) {
            return cbk();
          }

          return cbk(null, res);
        });
      }],

      // Get channels
      getChannels: ['getNode', 'getVersion', ({getNode, getVersion}, cbk) => {
        // In LND 0.13.0 and after the returned channel data is accurate
        if (!!getVersion && !badVers.includes(getVersion.version)) {
          return cbk(null, getNode.channels);
        }

        const channelIds = getNode.channels.map(n => n.id);

        // Fetch the channels directly as getNode gives back wrong policies
        return asyncMapLimit(channelIds, getChannelLimit, (id, cbk) => {
          return getChannel({id, lnd: args.lnd}, cbk);
        },
        cbk);
      }],

      // Final node details
      node: ['getChannels', 'getNode', ({getChannels, getNode}, cbk) => {
        return cbk(null, {
          alias: getNode.alias,
          capacity: getNode.capacity,
          channel_count: getNode.channel_count,
          channels: getChannels,
          color: getNode.color,
          features: getNode.features,
          sockets: getNode.sockets,
          updated_at: getNode.updated_at,
        });
      }],
    },
    returnResult({reject, resolve, of: 'node'}, cbk));
  });
};
