const {deepStrictEqual} = require('node:assert').strict;
const {rejects} = require('node:assert').strict;
const test = require('node:test');

const {getBlockHeader} = require('./../../../lnd_methods');

const tests = [
  {
    args: {height: 'invalid'},
    description: 'A valid height is expected to get a block header',
    error: [400, 'ExpectedNumericBlockHeightOfHeaderToRetrieve'],
  },
  {
    args: {id: 'invalid'},
    description: 'A valid id is expected to get a block header',
    error: [400, 'ExpectedIdentifyingBlockHashOfHeaderToRetrieve'],
  },
  {
    args: {height: 1, id: Buffer.alloc(32).toString('hex')},
    description: 'Only a height or an id is required',
    error: [400, 'ExpectedEitherHeightOrIdNotBothForHeaderFetch'],
  },
  {
    args: {id: Buffer.alloc(32).toString('hex')},
    description: 'An lnd object is required to get a block header',
    error: [400, 'ExpectedAuthenticatedLndToRetrieveBlockHeader'],
  },
  {
    args: {
      lnd: {
        blocks: {
          getBestBlock: ({}, cbk) => cbk({
            details: 'unknown method GetBlockHeader for service chainrpc.ChainKit',
          }),
          getBlockHeader: ({}, cbk) => cbk('err'),
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
          getBlockHeader: ({}, cbk) => cbk('getBlockErr'),
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
          getBlockHeader: ({}, cbk) => cbk(),
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
          getBlockHeader: ({}, cbk) => cbk(),
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
          getBlockHash: ({}, cbk) => cbk({
            details: 'unknown method GetBlockHeader for service chainrpc.ChainKit',
          }),
          getBlockHeader: ({}, cbk) => cbk(),
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
          getBlockHash: ({}, cbk) => cbk('err'),
          getBlockHeader: ({}, cbk) => cbk(),
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
          getBlockHash: ({}, cbk) => cbk(),
          getBlockHeader: ({}, cbk) => cbk(),
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
          getBlockHash: ({}, cbk) => cbk(null, {}),
          getBlockHeader: ({}, cbk) => cbk(),
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
          getBlockHeader: ({}, cbk) => cbk({details: '-5: Block not found'}),
        },
      },
    },
    description: 'An error is returned when a block is not found',
    error: [404, 'BlockForHeaderNotFound'],
  },
  {
    args: {
      id: Buffer.alloc(32).toString('hex'),
      lnd: {
        blocks: {
          getBlockHeader: ({}, cbk) => cbk({
            details: 'unknown method GetBlockHeader for service chainrpc.ChainKit',
          }),
        },
      },
    },
    description: 'An error is returned when the method is not supported',
    error: [501, 'GetBlockHeaderMethodNotSupported'],
  },
  {
    args: {
      id: Buffer.alloc(32).toString('hex'),
      lnd: {blocks: {getBlockHeader: ({}, cbk) => cbk('err')}},
    },
    description: 'An error is returned',
    error: [503, 'UnexpectedErrorWhenGettingBlockHeader', {err: 'err'}],
  },
  {
    args: {
      id: Buffer.alloc(32).toString('hex'),
      lnd: {blocks: {getBlockHeader: ({}, cbk) => cbk()}},
    },
    description: 'A result is expected',
    error: [503, 'ExpectedResponseForChainBlockHeaderRequest'],
  },
  {
    args: {
      id: Buffer.alloc(32).toString('hex'),
      lnd: {blocks: {getBlockHeader: ({}, cbk) => cbk(null, {})}},
    },
    description: 'A resulting block header is expected',
    error: [503, 'ExpectedRawHeaderInChainBlockHeaderResponse'],
  },
  {
    args: {
      lnd: {
        blocks: {
          getBestBlock: ({}, cbk) => cbk(null, {
            block_hash: Buffer.alloc(1),
          }),
          getBlockHeader: ({}, cbk) => cbk(null, {
            raw_block_header: Buffer.alloc(1),
          }),
        },
      },
    },
    description: 'The chain tip block header is returned',
    expected: {header: '00'},
  },
  {
    args: {
      height: 1,
      lnd: {
        blocks: {
          getBlockHash: ({}, cbk) => cbk(null, {
            block_hash: Buffer.alloc(1),
          }),
          getBlockHeader: ({}, cbk) => cbk(null, {
            raw_block_header: Buffer.alloc(1),
          }),
        },
      },
    },
    description: 'A block header at a height is returned',
    expected: {header: '00'},
  },
  {
    args: {
      id: Buffer.alloc(32).toString('hex'),
      lnd: {
        blocks: {
          getBlockHeader: ({}, cbk) => cbk(null, {
            raw_block_header: Buffer.alloc(1),
          }),
        },
      },
    },
    description: 'A block header is returned',
    expected: {header: '00'},
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async () => {
    if (!!error) {
      await rejects(() => getBlockHeader(args), error, 'Got expected error');
    } else {
      const res = await getBlockHeader(args);

      deepStrictEqual(res, expected, 'Got expected result');
    }

    return;
  });
});
