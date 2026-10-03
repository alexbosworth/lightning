import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getChannel, GetChannelResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const id = 'id';
const transaction_id = 'tx_id';
const transaction_vout = 0;

// @ts-expect-error
getChannel();
// @ts-expect-error
getChannel({});

// Expect error because only one of id or transaction_id/transaction_vout is allowed
// @ts-expect-error
getChannel({lnd, id, transaction_id, transaction_vout});

expectType<GetChannelResult>()(await getChannel({lnd, id}));
expectType<GetChannelResult>()(
  await getChannel({lnd, transaction_id, transaction_vout}),
);

expectType<void>()(
  getChannel({lnd, id}, (error, result) => {
    expectType<GetChannelResult>()(result);
  }),
);
