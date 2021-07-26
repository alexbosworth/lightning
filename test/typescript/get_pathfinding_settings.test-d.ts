import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {
  getPathfindingSettings,
  GetPathfindingSettingsResult,
} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

expectError(getPathfindingSettings());
expectError(getPathfindingSettings({}));

expectType<GetPathfindingSettingsResult>(await getPathfindingSettings({lnd}));

expectType<void>(
  getPathfindingSettings({lnd}, (error, result) => {
    expectType<GetPathfindingSettingsResult>(result);
  })
);
