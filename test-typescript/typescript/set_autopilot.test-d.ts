import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {setAutopilot} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

const candidate_nodes = [
  {
    public_key: Buffer.alloc(33).toString('hex'),
    score: 50000000,
  },
];

const args = {lnd};
const argsWithEnabled = {...args, is_enabled: true} as const;
const argsWithDisabled = {...args, is_enabled: false} as const;
const argsWithNodes = {...args, candidate_nodes};
const argsWithNodesAndEnabled = {...argsWithNodes, is_enabled: true} as const;

// @ts-expect-error
setAutopilot();
// @ts-expect-error
setAutopilot({});
// @ts-expect-error
setAutopilot({lnd}); // Nodes or enabled status is required
// @ts-expect-error
setAutopilot({lnd, candidate_nodes, is_enabled: false});

expectType<void>()(await setAutopilot(argsWithEnabled));
expectType<void>()(await setAutopilot(argsWithDisabled));
expectType<void>()(await setAutopilot(argsWithNodes));
expectType<void>()(await setAutopilot(argsWithNodesAndEnabled));

expectType<void>()(setAutopilot(argsWithEnabled, (error) => {}));
expectType<void>()(setAutopilot(argsWithDisabled, (error) => {}));
expectType<void>()(setAutopilot(argsWithNodes, (error) => {}));
expectType<void>()(setAutopilot(argsWithNodesAndEnabled, (error) => {}));
