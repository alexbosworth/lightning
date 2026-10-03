import {expectType} from '../expect';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getWalletVersion, GetWalletVersionResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;

// @ts-expect-error
getWalletVersion();
// @ts-expect-error
getWalletVersion({});

expectType<GetWalletVersionResult>()(await getWalletVersion({lnd}));

expectType<void>()(
  getWalletVersion({lnd}, (error, result) => {
    expectType<GetWalletVersionResult>()(result);
  })
);
