import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {probeForRoute, ProbeForRouteResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

const destination = 'destination';
const tokens = 21;
const mtokens = '21';
const outgoing_channels = ['0x0x1', '0x0x2'];
const paths = [
  {
    base_fee_mtokens: '1',
    cltv_delta: 1,
    fee_rate: 1,
    hops: [{encrypted_data: '00', relay_key: 'relay_key'}],
    key: 'key',
  },
];

expectError(probeForRoute());
expectError(probeForRoute({}));

expectError(probeForRoute({lnd}));
expectError(probeForRoute({destination}));
expectError(probeForRoute({tokens}));
expectError(probeForRoute({mtokens}));

expectError(probeForRoute({lnd, destination}));
expectError(probeForRoute({lnd, paths}));
expectError(probeForRoute({lnd, tokens}));
expectError(probeForRoute({lnd, mtokens}));
expectError(
  probeForRoute({lnd, destination, tokens, outgoing_channels: '0x0x1'})
);

expectType<ProbeForRouteResult>(
  await probeForRoute({lnd, destination, tokens})
);
expectType<ProbeForRouteResult>(await probeForRoute({lnd, paths, tokens}));
expectType<ProbeForRouteResult>(
  await probeForRoute({lnd, destination, paths, tokens})
);
expectType<ProbeForRouteResult>(
  await probeForRoute({lnd, destination, mtokens})
);
expectType<ProbeForRouteResult>(
  await probeForRoute({lnd, destination, outgoing_channels, tokens})
);

expectType<void>(
  probeForRoute({lnd, destination, tokens}, (error, result) => {
    expectType<ProbeForRouteResult>(result);
  })
);
expectType<void>(
  probeForRoute({lnd, destination, mtokens}, (error, result) => {
    expectType<ProbeForRouteResult>(result);
  })
);
