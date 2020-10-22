const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const {keys} = Object;
const method = 'getNodeMetrics';
const score = ratio => Math.floor(ratio * 1e6);
const type = 'default';
const types = ['BETWEENNESS_CENTRALITY'];
const unsupportedErrorMessage = 'unknown service lnrpc.Lightning';

/** Get the graph centrality scores of the nodes on the network

  Scores are from 0 to 1,000,000.

  Requires `info:read` permission

  {
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk or Promise
  {
    nodes: [{
      betweenness: <Betweenness Centrality Number>
      betweenness_normalized: <Normalized Betweenness Centrality Number>
      public_key: <Node Public Key Hex String>
    }]
  }
*/
module.exports = ({lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedAuthenticatedLndApiToGetCentrality']);
        }

        return cbk();
      },

      // Get node metrics from LND
      getNodeMetrics: ['validate', ({}, cbk) => {
        return lnd[type][method]({types}, (err, res) => {
          if (!!err && err.details === unsupportedErrorMessage) {
            return cbk([501, 'ExpectedServerSupportForNodeMetricsMethod']);
          }

          if (!!err) {
            return cbk([503, 'UnexpectedErrorGettingCentrality', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedResultWhenGettingNetworkCentrality']);
          }

          if (!res.betweenness_centrality) {
            return cbk([503, 'ExpectedBetweennessCentralityInGetCentrality']);
          }

          const nodes = keys(res.betweenness_centrality).map(publicKey => {
            const centrality = res.betweenness_centrality[publicKey];

            return {
              betweenness: score(centrality.value),
              betweenness_normalized: score(centrality.normalized_value),
              public_key: publicKey,
            };
          });

          return cbk(null, {nodes});
        });
      }],
    },
    returnResult({reject, resolve, of: 'getNodeMetrics'}, cbk));
  });
};
