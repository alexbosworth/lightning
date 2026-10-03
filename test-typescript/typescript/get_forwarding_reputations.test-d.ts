import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {
  getForwardingReputations,
  GetForwardingReputationsResult,
} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

// @ts-expect-error
getForwardingReputations();
// @ts-expect-error
getForwardingReputations({});

expectType<GetForwardingReputationsResult>()(
  await getForwardingReputations({lnd})
);

expectType<void>()(
  getForwardingReputations({lnd}, (error, result) => {
    expectType<GetForwardingReputationsResult>()(result);
  })
);
