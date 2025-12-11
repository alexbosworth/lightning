import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {probeForRoute, ProbeForRouteResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

const destination = 'destination';
const tokens = 21;
const mtokens = '21';

expectError(probeForRoute());
expectError(probeForRoute({}));

expectError(probeForRoute({lnd}));
expectError(probeForRoute({destination}));
expectError(probeForRoute({tokens}));
expectError(probeForRoute({mtokens}));

expectError(probeForRoute({lnd, destination}));
expectError(probeForRoute({lnd, tokens}));
expectError(probeForRoute({lnd, mtokens}));

expectType<ProbeForRouteResult>(
  await probeForRoute({lnd, destination, tokens})
);
expectType<ProbeForRouteResult>(
  await probeForRoute({lnd, destination, mtokens})
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
