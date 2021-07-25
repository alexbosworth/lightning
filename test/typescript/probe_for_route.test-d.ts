import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {probeForRoute, ProbeForRouteResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

const destination = 'destination';
const tokens = 21;

expectError(probeForRoute());
expectError(probeForRoute({}));
expectError(probeForRoute({lnd}));
expectError(probeForRoute({destination}));
expectError(probeForRoute({tokens}));
expectError(probeForRoute({lnd, destination}));
expectError(probeForRoute({lnd, tokens}));

expectType<ProbeForRouteResult>(
  await probeForRoute({lnd, destination, tokens})
);

expectType<void>(
  probeForRoute({lnd, destination, tokens}, (error, result) => {
    expectType<ProbeForRouteResult>(result);
  })
);
