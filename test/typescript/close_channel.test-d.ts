import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {closeChannel, CloseChannelResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

const public_key = Buffer.alloc(33).toString('hex');
const socket = 'socket';
const id = 'id';
const tokens_per_vbyte = 1;

expectError(closeChannel());
expectError(closeChannel({}));

expectType<CloseChannelResult>(await closeChannel({lnd}));
expectType<CloseChannelResult>(await closeChannel({lnd, public_key, socket}));
expectType<CloseChannelResult>(await closeChannel({lnd, id}));
expectType<CloseChannelResult>(await closeChannel({lnd, tokens_per_vbyte}));

expectType<void>(
  closeChannel({lnd}, (error, result) => {
    expectType<CloseChannelResult>(result);
  })
);
expectType<void>(
  closeChannel({lnd, public_key, socket}, (error, result) => {
    expectType<CloseChannelResult>(result);
  })
);
expectType<void>(
  closeChannel({lnd, id}, (error, result) => {
    expectType<CloseChannelResult>(result);
  })
);
expectType<void>(
  closeChannel({lnd, tokens_per_vbyte}, (error, result) => {
    expectType<CloseChannelResult>(result);
  })
);
