const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const bufferAsHex = buffer => buffer.toString('hex');
const {isArray} = Array;
const {isBuffer} = Buffer;
const method = 'queryMissionControl';
const notFoundIndex = -1;
const timeAsDate = n => new Date(parseInt(n, 10) * 1e3).toISOString();
const type = 'router';

/** Get the set of forwarding reputations

  Requires `offchain:read` permission

  {
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk or Promise
  {
    nodes: [{
      peers: [{
        [failed_tokens]: <Failed to Forward Tokens Number>
        [forwarded_tokens]: <Forwarded Tokens Number>
        [last_failed_forward_at]: <Failed Forward At ISO-8601 Date String>
        [last_forward_at]: <Forwarded At ISO 8601 Date String>
        to_public_key: <To Public Key Hex String>
      }]
      public_key: <Node Identity Public Key Hex String>
    }]
  }
*/
module.exports = ({lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedLndToGetForwardingReputations']);
        }

        return cbk();
      },

      // Get forwarding reputations
      getReputations: ['validate', ({}, cbk) => {
        return lnd[type][method]({}, (err, res) => {
          if (!!err) {
            return cbk([503, 'UnexpectedErrorGettingReputations', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedResponseToGetForwardReputationsQuery']);
          }

          if (!isArray(res.pairs)) {
            return cbk([503, 'ExpectedArrayOfPairsInReputationsResponse']);
          }

          return cbk(null, {pairs: res.pairs});
        });
      }],

      // Peers
      peers: ['getReputations', ({getReputations}, cbk) => {
        const {pairs} = getReputations;

        if (pairs.findIndex(n => !isBuffer(n.node_from)) !== notFoundIndex) {
          return cbk([503, 'ExpectedFromNodePublicKeyInReputationsResponse']);
        }

        if (pairs.findIndex(n => !isBuffer(n.node_to)) !== notFoundIndex) {
          return cbk([503, 'ExpectedToNodePublicKeyInReputationsResponse'])
        }

        return cbk(null, pairs.map(pair => {
          const forwardAmount = pair.history.success_amt_sat;
          const lastFailAt = Number(pair.history.fail_time) || undefined;
          const successAt = Number(pair.history.success_time) || undefined;

          const isFail = !!lastFailAt;
          const isSuccess = !!successAt;

          return {
            failed_tokens: !!isFail ? Number(pair.history.fail_amt_sat) : null,
            forwarded_tokens: !!isSuccess ? Number(forwardAmount) : null,
            last_failed_forward_at: !isFail ? null : timeAsDate(lastFailAt),
            last_forward_at: !!isSuccess ? timeAsDate(successAt) : null,
            public_key: bufferAsHex(pair.node_from),
            to_public_key: bufferAsHex(pair.node_to),
          };
        }));
      }],

      // Final set of reputations
      reputations: ['peers', ({peers}, cbk) => {
        const nodes = [];

        peers.filter(pair => {
          if (!!nodes.find(n => n.public_key === pair.public_key)) {
            return;
          }

          return nodes.push({public_key: pair.public_key});
        });

        const nodesWithPeers = nodes.map(node => {
          const publicKey = node.public_key;

          return {
            peers: peers.filter(n => n.public_key === publicKey).map(n => ({
              failed_tokens: n.failed_tokens || undefined,
              forwarded_tokens: n.forwarded_tokens || undefined,
              last_failed_forward_at: n.last_failed_forward_at || undefined,
              last_forward_at: n.last_forward_at || undefined,
              to_public_key: n.to_public_key,
            })),
            public_key: publicKey,
          };
        });

        return cbk(null, {nodes: nodesWithPeers});
      }],
    },
    returnResult({reject, resolve, of: 'reputations'}, cbk));
  });
};
