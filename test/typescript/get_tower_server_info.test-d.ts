import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getTowerServerInfo, GetTowerServerInfoResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

expectError(getTowerServerInfo());
expectError(getTowerServerInfo({}));

expectType<GetTowerServerInfoResult>(await getTowerServerInfo({lnd}));

expectType<void>(
  getTowerServerInfo({lnd}, (error, result) => {
    expectType<GetTowerServerInfoResult>(result);
  })
);
