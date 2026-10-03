import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {
  getSettlementStatus,
  GetSettlementStatusResult,
} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const channel = 'channel id';
const payment = 0;

// @ts-expect-error
getSettlementStatus();
// @ts-expect-error
getSettlementStatus({});
// @ts-expect-error
getSettlementStatus({lnd});
// @ts-expect-error
getSettlementStatus({lnd, channel});
// @ts-expect-error
getSettlementStatus({lnd, payment});

expectType<GetSettlementStatusResult>()(
  await getSettlementStatus({lnd, channel, payment})
);

expectType<void>()(
  getSettlementStatus({lnd, channel, payment}, (error, result) => {
    expectType<GetSettlementStatusResult>()(result);
  })
);
