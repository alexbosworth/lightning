import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getTowerServerInfo, GetTowerServerInfoResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

// @ts-expect-error
getTowerServerInfo();
// @ts-expect-error
getTowerServerInfo({});

expectType<GetTowerServerInfoResult>()(await getTowerServerInfo({lnd}));

expectType<void>()(
  getTowerServerInfo({lnd}, (error, result) => {
    expectType<GetTowerServerInfoResult>()(result);
  })
);
