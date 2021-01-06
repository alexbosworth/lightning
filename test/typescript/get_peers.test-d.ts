import {expectError, expectType} from 'tsd';
import {getPeers, GetPeersResult} from '../../lnd_methods';
import {AuthenticatedLnd} from '../../typescript/authenticated_lnd_grpc';

const lnd = {} as AuthenticatedLnd;

expectError(getPeers());
expectError(getPeers({}));
expectType<GetPeersResult>(await getPeers({lnd}));
expectType<void>(
  getPeers({lnd}, (error, result) => {
    expectType<GetPeersResult>(result);
  })
);
