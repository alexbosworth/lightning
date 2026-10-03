import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getRouteConfidence, GetRouteConfidenceResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

const from = 'pubkey';
const hops = [
  {
    forward_mtokens: '10',
    public_key: 'public_key',
  },
];

// @ts-expect-error
getRouteConfidence();
// @ts-expect-error
getRouteConfidence({});
// @ts-expect-error
getRouteConfidence({lnd});
// @ts-expect-error
getRouteConfidence({hops});
// @ts-expect-error
getRouteConfidence({from});
// @ts-expect-error
getRouteConfidence({lnd, from});

expectType<GetRouteConfidenceResult>()(await getRouteConfidence({lnd, hops}));
expectType<GetRouteConfidenceResult>()(
  await getRouteConfidence({lnd, hops, from})
);

expectType<void>()(
  getRouteConfidence({lnd, hops}, (error, result) => {
    expectType<GetRouteConfidenceResult>()(result);
  })
);
expectType<void>()(
  getRouteConfidence({lnd, hops, from}, (error, result) => {
    expectType<GetRouteConfidenceResult>()(result);
  })
);
