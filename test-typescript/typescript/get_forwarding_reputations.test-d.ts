import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {
  getForwardingReputations,
  GetForwardingReputationsResult,
} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

expectError(getForwardingReputations());
expectError(getForwardingReputations({}));

expectType<GetForwardingReputationsResult>(
  await getForwardingReputations({lnd})
);

expectType<void>(
  getForwardingReputations({lnd}, (error, result) => {
    expectType<GetForwardingReputationsResult>(result);
  })
);
