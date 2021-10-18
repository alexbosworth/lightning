import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {
  subscribeToRpcRequests,
  SubscribeToRpcRequestsResult,
} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const id = 'id';
const is_intercepting_close_channel_requests = true;
const is_intercepting_open_channel_requests = true;
const is_intercepting_pay_via_routes_requests = true;

expectError(subscribeToRpcRequests());
expectError(subscribeToRpcRequests({}));

expectType<SubscribeToRpcRequestsResult>(await subscribeToRpcRequests({lnd}));
expectType<SubscribeToRpcRequestsResult>(
  await subscribeToRpcRequests({
    lnd,
    id,
    is_intercepting_close_channel_requests,
    is_intercepting_open_channel_requests,
    is_intercepting_pay_via_routes_requests,
  })
);

expectType<void>(
  subscribeToRpcRequests({lnd}, (err, res) => {
    expectType<SubscribeToRpcRequestsResult>(res);
  })
);
expectType<void>(
  subscribeToRpcRequests(
    {
      lnd,
      id,
      is_intercepting_close_channel_requests,
      is_intercepting_open_channel_requests,
      is_intercepting_pay_via_routes_requests,
    },
    (err, res) => {
      expectType<SubscribeToRpcRequestsResult>(res);
    }
  )
);
