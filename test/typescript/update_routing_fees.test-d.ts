import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {updateRoutingFees, UpdateRoutingFeesResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const args = {
  base_fee_tokens: 99,
  cltv_delta: 1,
  fee_rate: 99,
  max_htlc_mtokens: '1',
  transaction_id: '1',
  transaction_vout: 0,
};

expectError(updateRoutingFees());
expectError(updateRoutingFees({}));
expectError(
  updateRoutingFees({lnd, base_fee_mtokens: '1', base_fee_tokens: 1})
); // A single unit format base fee is expected
expectError(updateRoutingFees({lnd, transaction_id: '1'})); // A full chanpoint with vout is required for an update
expectError(updateRoutingFees({lnd, transaction_vout: 0})); // A full chanpoint is required for a routing fee update

expectType<UpdateRoutingFeesResult>(await updateRoutingFees({lnd}));
expectType<UpdateRoutingFeesResult>(await updateRoutingFees({lnd, ...args}));

expectType<void>(
  updateRoutingFees({lnd}, (error, result) => {
    expectType<UpdateRoutingFeesResult>(result);
  })
);
expectType<void>(
  updateRoutingFees({lnd, ...args}, (error, result) => {
    expectType<UpdateRoutingFeesResult>(result);
  })
);
