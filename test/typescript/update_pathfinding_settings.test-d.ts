import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {updatePathfindingSettings} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

const baseline_success_rate = 1;
const max_payment_records = 1;
const node_ignore_rate = 1;
const penalty_half_life_ms = 1;

expectError(updatePathfindingSettings());
expectError(updatePathfindingSettings({}));

expectType<void>(await updatePathfindingSettings({lnd}));
expectType<void>(
  await updatePathfindingSettings({
    lnd,
    baseline_success_rate,
    max_payment_records,
    node_ignore_rate,
    penalty_half_life_ms,
  })
);

expectType<void>(updatePathfindingSettings({lnd}, () => {}));
expectType<void>(
  updatePathfindingSettings(
    {
      lnd,
      baseline_success_rate,
      max_payment_records,
      node_ignore_rate,
      penalty_half_life_ms,
    },
    () => {}
  )
);
