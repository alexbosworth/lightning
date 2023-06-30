const {deepStrictEqual} = require('node:assert').strict;
const {rejects} = require('node:assert').strict;
const test = require('node:test');

const {getBlock} = require('./../../../lnd_methods');

const tests = [
  {
    args: {height: 'invalid'},
    description: 'A valid height is expected to get a block',
    error: [400, 'ExpectedNumericBlockHeightOfBlockToRetrieve'],
  },
  {
    args: {id: 'invalid'},
    description: 'A valid id is expected to get a block',
    error: [400, 'ExpectedIdentifyingBlockHashOfBlockToRetrieve'],
  },
  {
    args: {height: 1, id: Buffer.alloc(32).toString('hex')},
    description: 'Only a height or an id is required',
    error: [400, 'ExpectedEitherHeightOrIdNotBoth'],
  },
  {
    args: {id: Buffer.alloc(32).toString('hex')},
    description: 'An lnd object is required to get a block',
    error: [400, 'ExpectedAuthenticatedLndToRetrieveBlock'],
  },
  {
    args: {
      lnd: {
        blocks: {
          getBestBlock: ({}, cbk) => cbk({
            details: 'unknown service chainrpc.ChainKit',
          }),
          getBlock: ({}, cbk) => cbk('err'),
        },
      },
    },
    description: 'An unsupported error is returned',
    error: [501, 'GetBestBlockMethodNotSupported'],
  },
  {
    args: {
      lnd: {
        blocks: {
          getBestBlock: ({}, cbk) => cbk('err'),
          getBlock: ({}, cbk) => cbk('getBlockErr'),
        },
      },
    },
    description: 'An error is returned',
    error: [503, 'UnexpectedErrorGettingBestBlock', {err: 'err'}],
  },
  {
    args: {
      lnd: {
        blocks: {
          getBestBlock: ({}, cbk) => cbk(),
          getBlock: ({}, cbk) => cbk(),
        },
      },
    },
    description: 'An error is returned when there is no best block result',
    error: [503, 'ExpectedResponseForBestBlockRequest'],
  },
  {
    args: {
      lnd: {
        blocks: {
          getBestBlock: ({}, cbk) => cbk(null, {}),
          getBlock: ({}, cbk) => cbk(),
        },
      },
    },
    description: 'An error is returned when there is no result info',
    error: [503, 'ExpectedChainTipInfoInGetBestBlockResponse'],
  },
  {
    args: {
      height: 1,
      lnd: {
        blocks: {
          getBlock: ({}, cbk) => cbk(),
          getBlockHash: ({}, cbk) => cbk({
            details: 'unknown service chainrpc.ChainKit',
          }),
        },
      },
    },
    description: 'An error is returned when get hash for height unsupported',
    error: [501, 'GetBlockHashMethodNotSupported'],
  },
  {
    args: {
      height: 1,
      lnd: {
        blocks: {
          getBlock: ({}, cbk) => cbk(),
          getBlockHash: ({}, cbk) => cbk('err'),
        },
      },
    },
    description: 'An unexpected error for getting block hash is returned',
    error: [503, 'UnexpectedErrorGettingBlockHash', {err: 'err'}],
  },
  {
    args: {
      height: 1,
      lnd: {
        blocks: {
          getBlock: ({}, cbk) => cbk(),
          getBlockHash: ({}, cbk) => cbk(),
        },
      },
    },
    description: 'A result is expected for getting a block hash',
    error: [503, 'ExpectedResponseForGetBlockHashRequest'],
  },
  {
    args: {
      height: 1,
      lnd: {
        blocks: {
          getBlock: ({}, cbk) => cbk(),
          getBlockHash: ({}, cbk) => cbk(null, {}),
        },
      },
    },
    description: 'A result hash is expected for getting a block hash',
    error: [503, 'ExpectedBlockHashInGetBlockHashResponse'],
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
      lnd: {
        blocks: {
          getBestBlock: ({}, cbk) => cbk(null, {block_hash: Buffer.alloc(1)}),
          getBlock: ({}, cbk) => cbk(null, {raw_block: Buffer.alloc(1)}),
        },
      },
    },
    description: 'The chain tip block is returned',
    expected: {block: '00'},
  },
  {
    args: {
      height: 1,
      lnd: {
        blocks: {
          getBlock: ({}, cbk) => cbk(null, {raw_block: Buffer.alloc(1)}),
          getBlockHash: ({}, cbk) => cbk(null, {block_hash: Buffer.alloc(1)}),
        },
      },
    },
    description: 'A block at a height is returned',
    expected: {block: '00'},
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
  return test(description, async () => {
    if (!!error) {
      await rejects(() => getBlock(args), error, 'Got expected error');
    } else {
      const res = await getBlock(args);

      deepStrictEqual(res, expected, 'Got expected result');
    }

    return;
  });
});
