import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {
  prepareForChannelProposal,
  PrepareForChannelProposalResult,
} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

const key_index = 1;
const remote_key = Buffer.alloc(33, 2).toString('hex');
const transaction_id = Buffer.alloc(32).toString('hex');
const transaction_vout = 0;
const cooperative_close_delay = 1;
const id = 'id';

expectError(prepareForChannelProposal());
expectError(prepareForChannelProposal({}));
expectError(prepareForChannelProposal({lnd}));

expectType<PrepareForChannelProposalResult>(
  await prepareForChannelProposal({
    lnd,
    key_index,
    remote_key,
    transaction_id,
    transaction_vout,
  })
);
expectType<PrepareForChannelProposalResult>(
  await prepareForChannelProposal({
    lnd,
    key_index,
    remote_key,
    transaction_id,
    transaction_vout,
    cooperative_close_delay,
    id,
  })
);

expectType<void>(
  prepareForChannelProposal(
    {lnd, key_index, remote_key, transaction_id, transaction_vout},
    (error, result) => {
      expectType<PrepareForChannelProposalResult>(result);
    }
  )
);
expectType<void>(
  prepareForChannelProposal(
    {
      lnd,
      key_index,
      remote_key,
      transaction_id,
      transaction_vout,
      cooperative_close_delay,
      id,
    },
    (error, result) => {
      expectType<PrepareForChannelProposalResult>(result);
    }
  )
);
