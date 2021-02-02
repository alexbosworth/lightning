import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {
  getForwardingConfidence,
  GetForwardingConfidenceResult,
} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const from = 'from';
const mtokens = '100';
const to = 'to';

expectError(getForwardingConfidence());
expectError(getForwardingConfidence({}));
expectError(getForwardingConfidence({from}));
expectError(getForwardingConfidence({from, to}));
expectError(getForwardingConfidence({from, mtokens}));
expectError(getForwardingConfidence({from, to, mtokens}));
expectError(getForwardingConfidence({to}));
expectError(getForwardingConfidence({to, mtokens}));
expectError(getForwardingConfidence({mtokens}));
expectError(getForwardingConfidence({lnd}));
expectError(getForwardingConfidence({lnd, from}));
expectError(getForwardingConfidence({lnd, from, to}));
expectError(getForwardingConfidence({lnd, from, mtokens}));
expectError(getForwardingConfidence({lnd, to}));
expectError(getForwardingConfidence({lnd, to, mtokens}));
expectError(getForwardingConfidence({lnd, mtokens}));

expectType<GetForwardingConfidenceResult>(
  await getForwardingConfidence({lnd, from, to, mtokens})
);

expectType<void>(
  getForwardingConfidence({lnd, from, to, mtokens}, (error, result) => {
    expectType<GetForwardingConfidenceResult>(result);
  })
);
