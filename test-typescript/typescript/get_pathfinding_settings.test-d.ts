import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {
  getPathfindingSettings,
  GetPathfindingSettingsResult,
} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

// @ts-expect-error
getPathfindingSettings();
// @ts-expect-error
getPathfindingSettings({});

expectType<GetPathfindingSettingsResult>()(await getPathfindingSettings({lnd}));

expectType<void>()(
  getPathfindingSettings({lnd}, (error, result) => {
    expectType<GetPathfindingSettingsResult>()(result);
  })
);
