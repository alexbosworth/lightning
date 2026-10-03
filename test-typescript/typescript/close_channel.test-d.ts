import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {closeChannel, CloseChannelResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

const id = 'id';
const transaction_id = Buffer.alloc(32).toString('hex');
const transaction_vout = 0;
const txOutpoint = {transaction_id, transaction_vout};
const public_key = Buffer.alloc(33).toString('hex');
const socket = 'socket';
const target_confirmations = 6;
const tokens_per_vbyte = 1;
const address = 'address';

const argsWithChannelId = {lnd, id};
const argsWithTxOutpoint = {lnd, ...txOutpoint};

// @ts-expect-error
closeChannel();
// @ts-expect-error
closeChannel({});
// @ts-expect-error
closeChannel({lnd});
// @ts-expect-error
closeChannel({lnd, id, transaction_id, transaction_vout}); // Either id or transaction outpoint must be specified

/** Force Close */
// Address cannot be specified on force close
const addressWithForceClose = {
  is_force_close: true,
  address,
} as const;
const args1 = {
  ...argsWithChannelId,
  ...addressWithForceClose,
};
// @ts-expect-error
await closeChannel(args1);
// @ts-expect-error
closeChannel(args1, (err, result) => {
  expectType<CloseChannelResult>()(result);
});
const args2 = {
  ...argsWithTxOutpoint,
  ...addressWithForceClose,
};
// @ts-expect-error
await closeChannel(args2);
// @ts-expect-error
closeChannel(args2, (err, result) => {
  expectType<CloseChannelResult>()(result);
});

// Setting fee rate is not allowed on force closes
const feeRateWithForceClose = {
  is_force_close: true,
  tokens_per_vbyte,
} as const;
const args3 = {
  ...feeRateWithForceClose,
  ...argsWithChannelId,
};
// @ts-expect-error
await closeChannel(args3);
// @ts-expect-error
closeChannel(args3, (err, result) => {
  expectType<CloseChannelResult>()(result);
});
const args4 = {
  ...feeRateWithForceClose,
  ...argsWithTxOutpoint,
};
// @ts-expect-error
await closeChannel(args4);
// @ts-expect-error
closeChannel(args4, (err, result) => {
  expectType<CloseChannelResult>()(result);
});

// Should work
const args5 = {
  ...argsWithChannelId,
  is_force_close: true,
} as const;
expectType<CloseChannelResult>()(await closeChannel(args5));
expectType<void>()(
  closeChannel(args5, (err, result) => {
    expectType<CloseChannelResult>()(result);
  })
);
const args6 = {
  ...argsWithTxOutpoint,
  is_force_close: true,
} as const;
expectType<CloseChannelResult>()(await closeChannel(args6));
expectType<void>()(
  closeChannel(args6, (err, result) => {
    expectType<CloseChannelResult>()(result);
  })
);

/** Cooperative Close */
// A socket is required when public key is specified
const args7 = {
  ...argsWithChannelId,
  public_key,
};
// @ts-expect-error
await closeChannel(args7);
// @ts-expect-error
closeChannel(args7, (err, result) => {
  expectType<CloseChannelResult>()(result);
});
const args8 = {
  ...argsWithTxOutpoint,
  public_key,
};
// @ts-expect-error
await closeChannel(args8);
// @ts-expect-error
closeChannel(args8, (err, result) => {
  expectType<CloseChannelResult>()(result);
});

// A public key is required when public key is specified
const args9 = {
  ...argsWithChannelId,
  socket,
};
// @ts-expect-error
await closeChannel(args9);
// @ts-expect-error
closeChannel(args9, (err, result) => {
  expectType<CloseChannelResult>()(result);
});
const args10 = {
  ...argsWithTxOutpoint,
  socket,
};
// @ts-expect-error
await closeChannel(args10);
// @ts-expect-error
closeChannel(args10, (err, result) => {
  expectType<CloseChannelResult>()(result);
});

// Either confs or fee rate is allowed, not both
const confsAndFeeRate = {
  target_confirmations,
  tokens_per_vbyte,
};
const args11 = {
  ...argsWithChannelId,
  ...confsAndFeeRate,
};
// @ts-expect-error
await closeChannel(args11);
// @ts-expect-error
closeChannel(args11, (err, result) => {
  expectType<CloseChannelResult>()(result);
});
const args12 = {
  ...argsWithTxOutpoint,
  ...confsAndFeeRate,
};
// @ts-expect-error
await closeChannel(args12);
// @ts-expect-error
closeChannel(args12, (err, result) => {
  expectType<CloseChannelResult>()(result);
});

// With channel ID or tx outpoint
expectType<CloseChannelResult>()(await closeChannel(argsWithChannelId));
expectType<void>()(
  closeChannel(argsWithChannelId, (err, result) => {
    expectType<CloseChannelResult>()(result);
  })
);
expectType<CloseChannelResult>()(await closeChannel(argsWithTxOutpoint));
expectType<void>()(
  closeChannel(argsWithTxOutpoint, (err, result) => {
    expectType<CloseChannelResult>()(result);
  })
);

// With address
const args13 = {
  ...argsWithChannelId,
  address,
};
expectType<CloseChannelResult>()(await closeChannel(args13));
expectType<void>()(
  closeChannel(args13, (err, result) => {
    expectType<CloseChannelResult>()(result);
  })
);
const args14 = {
  ...argsWithTxOutpoint,
  address,
};
expectType<CloseChannelResult>()(await closeChannel(args14));
expectType<void>()(
  closeChannel(args14, (err, result) => {
    expectType<CloseChannelResult>()(result);
  })
);

// With public key and socket
const publicKeyAndSocket = {
  public_key,
  socket,
};
const args15 = {
  ...argsWithChannelId,
  ...publicKeyAndSocket,
};
expectType<CloseChannelResult>()(await closeChannel(args15));
expectType<void>()(
  closeChannel(args15, (err, result) => {
    expectType<CloseChannelResult>()(result);
  })
);
const args16 = {
  ...argsWithTxOutpoint,
  ...publicKeyAndSocket,
};
expectType<CloseChannelResult>()(await closeChannel(args16));
expectType<void>()(
  closeChannel(args16, (err, result) => {
    expectType<CloseChannelResult>()(result);
  })
);

// With target confirmations
const args17 = {
  ...argsWithChannelId,
  target_confirmations,
};
expectType<CloseChannelResult>()(await closeChannel(args17));
expectType<void>()(
  closeChannel(args17, (err, result) => {
    expectType<CloseChannelResult>()(result);
  })
);
const args18 = {
  ...argsWithTxOutpoint,
  target_confirmations,
};
expectType<CloseChannelResult>()(await closeChannel(args18));
expectType<void>()(
  closeChannel(args18, (err, result) => {
    expectType<CloseChannelResult>()(result);
  })
);

// With tokens per vbyte
const args19 = {
  ...argsWithChannelId,
  tokens_per_vbyte,
};
expectType<CloseChannelResult>()(await closeChannel(args19));
expectType<void>()(
  closeChannel(args19, (err, result) => {
    expectType<CloseChannelResult>()(result);
  })
);
const args20 = {
  ...argsWithTxOutpoint,
  tokens_per_vbyte,
};
expectType<CloseChannelResult>()(await closeChannel(args20));
expectType<void>()(
  closeChannel(args20, (err, result) => {
    expectType<CloseChannelResult>()(result);
  })
);
