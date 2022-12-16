const {test} = require('@alexbosworth/tap');

const {getBlock} = require('./../../../lnd_methods');

const tests = [
  {
    args: {},
    description: 'An id is expected to get a block',
    error: [400, 'ExpectedIdentifyingBlockHashOfBlockToRetrieve'],
  },
  {
    args: {id: Buffer.alloc(32).toString('hex')},
    description: 'An lnd object is required to get a block',
    error: [400, 'ExpectedAuthenticatedLndToRetrieveBlock'],
  },
  {
    args: {
      id: Buffer.alloc(32).toString('hex'),
      lnd: {
        blocks: {
          getBlock: ({}, cbk) => cbk({details: '-5: Block not found'}),
        },
      },
    },
    description: 'An error is returned when a block is not found',
    error: [404, 'BlockNotFound'],
  },
  {
    args: {
      id: Buffer.alloc(32).toString('hex'),
      lnd: {
        blocks: {
          getBlock: ({}, cbk) => cbk({
            details: 'unknown service chainrpc.ChainKit',
          }),
        },
      },
    },
    description: 'An error is returned when the method is not supported',
    error: [501, 'GetBlockMethodNotSupported'],
  },
  {
    args: {
      id: Buffer.alloc(32).toString('hex'),
      lnd: {blocks: {getBlock: ({}, cbk) => cbk('err')}},
    },
    description: 'An error is returned',
    error: [503, 'UnexpectedErrorWhenGettingChainBlock', {err: 'err'}],
  },
  {
    args: {
      id: Buffer.alloc(32).toString('hex'),
      lnd: {blocks: {getBlock: ({}, cbk) => cbk()}},
    },
    description: 'A result is expected',
    error: [503, 'ExpectedResponseForChainBlockRequest'],
  },
  {
    args: {
      id: Buffer.alloc(32).toString('hex'),
      lnd: {blocks: {getBlock: ({}, cbk) => cbk(null, {})}},
    },
    description: 'A resulting block is expected',
    error: [503, 'ExpectedRawBlockInChainBlockResponse'],
  },
  {
    args: {
      id: Buffer.alloc(32).toString('hex'),
      lnd: {
        blocks: {
          getBlock: ({}, cbk) => cbk(null, {raw_block: Buffer.alloc(1)}),
        },
      },
    },
    description: 'A block is returned',
    expected: {block: '00'},
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({deepEqual, end, rejects, strictSame}) => {
    if (!!error) {
      await rejects(() => getBlock(args), error, 'Got expected error');
    } else {
      const res = await getBlock(args);

      strictSame(res, expected, 'Got expected result');
    }

    return end();
  });
});
