import {expectType} from '../expect';
import {getPeers, GetPeersResult} from '../../lnd_methods';
import {AuthenticatedLnd} from '../../lnd_grpc';

const lnd = {} as AuthenticatedLnd;

// @ts-expect-error
getPeers();
// @ts-expect-error
getPeers({});
expectType<GetPeersResult>()(await getPeers({lnd}));
expectType<void>()(
  getPeers({lnd}, (error, result) => {
    expectType<GetPeersResult>()(result);
  })
);
