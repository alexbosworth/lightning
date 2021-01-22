import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {getChannel, GetChannelResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const id = '00';

expectError(getChannel());
expectError(getChannel({}));

expectType<GetChannelResult>(await getChannel({lnd, id}));

expectType<void>(
  getChannel({lnd, id}, (error, result) => {
    expectType<GetChannelResult>(result);
  })
);
