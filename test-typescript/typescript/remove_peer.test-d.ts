import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {removePeer} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const public_key = Buffer.alloc(33).toString('hex');

expectError(removePeer());
expectError(removePeer({}));
expectError(removePeer({lnd}));
expectType<void>(await removePeer({lnd, public_key}));
expectType<void>(removePeer({lnd, public_key}, error => {}));
