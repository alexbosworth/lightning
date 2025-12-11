import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getAutopilot, GetAutopilotResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const node_scores = ['foo'];

expectError(getAutopilot());
expectError(getAutopilot({}));

expectType<GetAutopilotResult>(await getAutopilot({lnd}));
expectType<GetAutopilotResult>(await getAutopilot({lnd, node_scores}));

expectType<void>(
  getAutopilot({lnd}, (error, result) => {
    expectType<GetAutopilotResult>(result);
  })
);
expectType<void>(
  getAutopilot({lnd, node_scores}, (error, result) => {
    expectType<GetAutopilotResult>(result);
  })
);
