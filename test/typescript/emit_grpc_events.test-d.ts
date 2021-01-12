import {expectType, expectError} from 'tsd';
import WebSocket = require('ws');
import {emitGrpcEvents} from '../../lnd_gateway';

const ws = new WebSocket('address');

expectError(emitGrpcEvents());
expectError(emitGrpcEvents({}));
expectType<void>(emitGrpcEvents({ws}));
expectType<void>(emitGrpcEvents({cert: '00', ws}));
expectType<void>(emitGrpcEvents({socket: 'socket', ws}));
expectType<void>(emitGrpcEvents({cert: '00', socket: 'socket', ws}));
