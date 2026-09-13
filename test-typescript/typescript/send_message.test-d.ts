import {expectError, expectType} from 'tsd';
import {sendMessage as sendMessageFromRoot} from '../..';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {sendMessage, SendMessageArgs, SendMessageResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const inbound = [{encrypted_data: '00', relay_key: 'relaykey'}];
const key = 'pathkey';
const message = {type: '65537', value: '00'};
const outbound = ['peerkey'];
const reply = ['replykey'];
const args = {inbound, key, lnd, outbound};
const withOptions: SendMessageArgs = {...args, message, reply};

expectType<typeof sendMessage>(sendMessageFromRoot);

expectError(sendMessage());
expectError(sendMessage({}));
expectError(sendMessage({key, lnd, outbound}));
expectError(sendMessage({inbound, lnd, outbound}));
expectError(sendMessage({inbound, key, outbound}));
expectError(sendMessage({inbound, key, lnd}));
expectError(sendMessage({...args, inbound: [{encrypted_data: '00'}]}));
expectError(sendMessage({...args, inbound: [{relay_key: 'relaykey'}]}));
expectError(sendMessage({...args, message: '00'}));
expectError(sendMessage({...args, message: {type: '65537'}}));
expectError(sendMessage({...args, message: {value: '00'}}));
expectError(sendMessage({...args, message: {type: 65537, value: '00'}}));
expectError(sendMessage({...args, message: {type: '65537', value: 0}}));
expectError(sendMessage({...args, outbound: [1]}));
expectError(sendMessage({...args, reply: 'replykey'}));

expectType<Promise<SendMessageResult>>(sendMessage(args));
expectType<Promise<SendMessageResult>>(sendMessage({...args, message}));
expectType<SendMessageResult>(await sendMessage(withOptions));
expectType<string | undefined>((await sendMessage(args)).reply);

expectType<void>(
  sendMessage(args, (error, result) => {
    expectType<SendMessageResult>(result);
    expectType<string | undefined>(result.reply);
  })
);
expectType<void>(
  sendMessage(withOptions, (error, result) => {
    expectType<SendMessageResult>(result);
    expectType<string | undefined>(result.reply);
  })
);
