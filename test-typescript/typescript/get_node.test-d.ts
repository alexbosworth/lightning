import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getNode, GetNodeResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const public_key = 'public_key';
const is_omitting_channels = true;

expectError(getNode());
expectError(getNode({}));
expectError(getNode({public_key}));
expectError(getNode({is_omitting_channels}));
expectError(getNode({lnd}));
expectError(getNode({lnd, is_omitting_channels}));

expectType<GetNodeResult>(await getNode({lnd, public_key}));
expectType<GetNodeResult>(
  await getNode({lnd, public_key, is_omitting_channels})
);

expectType<void>(
  getNode({lnd, public_key}, (error, result) => {
    expectType<GetNodeResult>(result);
  })
);
expectType<void>(
  getNode({lnd, public_key, is_omitting_channels}, (error, result) => {
    expectType<GetNodeResult>(result);
  })
);
