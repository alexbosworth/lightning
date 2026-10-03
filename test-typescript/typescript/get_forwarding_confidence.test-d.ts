import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {
  getForwardingConfidence,
  GetForwardingConfidenceResult,
} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const from = 'from';
const mtokens = '100';
const to = 'to';

// @ts-expect-error
getForwardingConfidence();
// @ts-expect-error
getForwardingConfidence({});
// @ts-expect-error
getForwardingConfidence({from});
// @ts-expect-error
getForwardingConfidence({from, to});
// @ts-expect-error
getForwardingConfidence({from, mtokens});
// @ts-expect-error
getForwardingConfidence({from, to, mtokens});
// @ts-expect-error
getForwardingConfidence({to});
// @ts-expect-error
getForwardingConfidence({to, mtokens});
// @ts-expect-error
getForwardingConfidence({mtokens});
// @ts-expect-error
getForwardingConfidence({lnd});
// @ts-expect-error
getForwardingConfidence({lnd, from});
// @ts-expect-error
getForwardingConfidence({lnd, from, to});
// @ts-expect-error
getForwardingConfidence({lnd, from, mtokens});
// @ts-expect-error
getForwardingConfidence({lnd, to});
// @ts-expect-error
getForwardingConfidence({lnd, to, mtokens});
// @ts-expect-error
getForwardingConfidence({lnd, mtokens});

expectType<GetForwardingConfidenceResult>()(
  await getForwardingConfidence({lnd, from, to, mtokens})
);

expectType<void>()(
  getForwardingConfidence({lnd, from, to, mtokens}, (error, result) => {
    expectType<GetForwardingConfidenceResult>()(result);
  })
);
