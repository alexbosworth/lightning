const EventEmitter = require('events');

const {test} = require('@alexbosworth/tap');

const {getHeight} = require('./../../../');
const {getInfoResponse} = require('./../fixtures');

const makeLnd = overrides => {
  const data = {hash: Buffer.alloc(32), height: 1};

  Object.keys(overrides).forEach(k => data[k] = overrides[k]);

  return {
    chain: {
      registerBlockEpochNtfn: ({}) => {
        const emitter = new EventEmitter();

        emitter.cancel = () => {};

        process.nextTick(() => emitter.emit('data', data));

        return emitter;
      },
    },
  };
};

const tests = [
  {
    args: {},
    description: 'LND is required',
    error: [400, 'ExpectedAuthenticatedLndToGetCurrrentHeight'],
  },
  {
    args: {
      lnd: {
        chain: {
          registerBlockEpochNtfn: ({}) => {
            const emitter = new EventEmitter();

            emitter.cancel = () => {};

            process.nextTick(() => emitter.emit('error', 'err'));

            return emitter;
          },
        },
        default: {
          getInfo: ({}, cbk) => cbk(null, getInfoResponse),
        },
      },
    },
    description: 'Got height from getInfo fallback',
    expected: {
      current_block_hash: Buffer.alloc(1).toString('hex'),
      current_block_height: 1,
    },
  },
  {
    args: {lnd: makeLnd({})},
    description: 'Got height',
    expected: {
      current_block_hash: Buffer.alloc(32).toString('hex'),
      current_block_height: 1,
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, equal, rejects, strictSame}) => {
    if (!!error) {
      await rejects(getHeight(args), error, 'Got expected error');
    } else {
      const got = await getHeight(args);

      strictSame(got, expected, 'Got expected result');
    }

    return end();
  });
});
