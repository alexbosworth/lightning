const {test} = require('@alexbosworth/tap');

const {getNetworkCentrality} = require('./../../../');

const makeLnd = ({err, res}) => {
  const response = {
    betweenness_centrality: {'00': {value: 0.5, normalized_value: 0.1}},
  };

  const r = res !== undefined ? res : response;

  return {default: {getNodeMetrics: ({}, cbk) => cbk(err, r)}};
};

const tests = [
  {
    args: {},
    description: 'LND is required to get network centrality',
    error: [400, 'ExpectedAuthenticatedLndApiToGetCentrality'],
  },
  {
    args: {lnd: makeLnd({err: {details: 'unknown service lnrpc.Lightning'}})},
    description: 'Method unsupported error returns error code',
    error: [501, 'ExpectedServerSupportForNodeMetricsMethod'],
  },
  {
    args: {lnd: makeLnd({err: 'err'})},
    description: 'Unexpected error returns error',
    error: [503, 'UnexpectedErrorGettingCentrality', {err: 'err'}],
  },
  {
    args: {lnd: makeLnd({res: null})},
    description: 'A response is expected',
    error: [503, 'ExpectedResultWhenGettingNetworkCentrality'],
  },
  {
    args: {lnd: makeLnd({res: {}})},
    description: 'A response with centrality is expected',
    error: [503, 'ExpectedBetweennessCentralityInGetCentrality'],
  },
  {
    args: {lnd: makeLnd({})},
    description: 'Network centrality is returned',
    expected: {
      nodes: [{
        betweenness: 5e5,
        betweenness_normalized: 1e5,
        public_key: '00',
      }],
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, rejects, strictSame}) => {
    if (!!error) {
      await rejects(() => getNetworkCentrality(args), error, 'Got error');
    } else {
      strictSame(await getNetworkCentrality(args), expected, 'Got expected');
    }

    return end();
  });
});
