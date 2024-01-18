const {deepStrictEqual} = require('node:assert').strict;
const {rejects} = require('node:assert').strict;
const test = require('node:test');

const {getConfiguration} = require('./../../../');

const makeLnd = ({custom, err, res}) => {
  const response = {config: {type: 'value'}, log: ['log']};

  return {
    default: {
      getDebugInfo: ({}, cbk) => cbk(err, res !== undefined ? res : response),
    },
  };
};

const tests = [
  {
    args: {},
    description: 'LND is required to get configuration info',
    error: [400, 'ExpectedAuthenticatedLndGrpcForGetConfigRequest'],
  },
  {
    args: {
      lnd: makeLnd({
        err: {
          details: 'unknown method GetDebugInfo for service lnrpc.Lightning',
        },
      }),
    },
    description: 'Unknown service returns unsupported info',
    error: [501, 'GetDebugConfigurationInfoNotSupported'],
  },
  {
    args: {lnd: makeLnd({err: 'err'})},
    description: 'Generic failure returns back the error',
    error: [503, 'UnexpectedGetDebugInfoError', {err: 'err'}],
  },
  {
    args: {lnd: makeLnd({res: null})},
    description: 'Valid result is expected',
    error: [503, 'ExpectedResponseForGetConfigurationRequest'],
  },
  {
    args: {lnd: makeLnd({res: {}})},
    description: 'Result should have a log',
    error: [503, 'ExpectedLogInConfigurationResponse'],
  },
  {
    args: {lnd: makeLnd({res: {log: [1]}})},
    description: 'Result should have a log with strings',
    error: [503, 'ExpectedAllLogEntriesAsStrings'],
  },
  {
    args: {lnd: makeLnd({res: {log: []}})},
    description: 'Result should have a config',
    error: [503, 'ExpectedArrayOfConfigurationOptionsInResponse'],
  },
  {
    args: {lnd: makeLnd({res: {config: {type: 1}, log: []}})},
    description: 'Result should have a config',
    error: [503, 'ExpectedAllConfigOptionsAsStrings'],
  },
  {
    args: {lnd: makeLnd({})},
    description: 'Configuration is returned',
    expected: {log: ['log'], options: [{type: 'type', value: 'value'}]},
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async () => {
    if (!!error) {
      await rejects(() => getConfiguration(args), error, 'Got error');
    } else {
      deepStrictEqual(await getConfiguration(args), expected, 'Got info');
    }

    return;
  });
});
