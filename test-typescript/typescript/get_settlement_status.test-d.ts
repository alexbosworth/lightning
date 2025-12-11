import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {
  getSettlementStatus,
  GetSettlementStatusResult,
} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const channel = 'channel id';
const payment = 0;

expectError(getSettlementStatus());
expectError(getSettlementStatus({}));
expectError(getSettlementStatus({lnd}));
expectError(getSettlementStatus({lnd, channel}));
expectError(getSettlementStatus({lnd, payment}));

expectType<GetSettlementStatusResult>(
  await getSettlementStatus({lnd, channel, payment})
);

expectType<void>(
  getSettlementStatus({lnd, channel, payment}, (error, result) => {
    expectType<GetSettlementStatusResult>(result);
  })
);
