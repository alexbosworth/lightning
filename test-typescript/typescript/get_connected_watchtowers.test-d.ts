import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {
  getConnectedWatchtowers,
  GetConnectedWatchTowersResult,
} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const is_anchor = true;
const is_taproot = true;

expectError(getConnectedWatchtowers());
expectError(getConnectedWatchtowers({}));
expectError(getConnectedWatchtowers({is_anchor}));

expectType<GetConnectedWatchTowersResult>(await getConnectedWatchtowers({lnd}));
expectType<GetConnectedWatchTowersResult>(
  await getConnectedWatchtowers({lnd, is_anchor})
);
expectType<GetConnectedWatchTowersResult>(
  await getConnectedWatchtowers({lnd, is_taproot})
);

expectType<void>(
  getConnectedWatchtowers({lnd}, (error, result) => {
    expectType<GetConnectedWatchTowersResult>(result);
  })
);
expectType<void>(
  getConnectedWatchtowers({lnd, is_anchor}, (error, result) => {
    expectType<GetConnectedWatchTowersResult>(result);
  })
);
expectType<void>(
  getConnectedWatchtowers({lnd, is_taproot}, (error, result) => {
    expectType<GetConnectedWatchTowersResult>(result);
  })
);
