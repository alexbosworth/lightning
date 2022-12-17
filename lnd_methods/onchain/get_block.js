const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const bufferAsHex = buffer => buffer.toString('hex');
const errorNotFound = '-5: Block not found';
const errorUnknownMethod = 'unknown service chainrpc.ChainKit';
const hexAsReversedBuffer = hex => Buffer.from(hex, 'hex').reverse();
const {isBuffer} = Buffer;
const isNumber = n => !isNaN(n);
const isHash = n => /^[0-9A-F]{64}$/i.test(n);
const method = 'getBlock';
const type = 'blocks';

/** Get a block in the chain

  This method requires LND built with `chainkit` build tag

  Requires `onchain:read` permission

  This method is not supported on LND 0.15.5 and below

  {
    [height]: <Block Height Number>
    [id]: <Block Hash Hex String>
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk or Promise
  {
    block: <Raw Block Bytes Hex String>
  }
*/
module.exports = ({height, id, lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (height !== undefined && !isNumber(height)) {
          return cbk([400, 'ExpectedNumericBlockHeightOfBlockToRetrieve']);
        }

        if (!!id && !isHash(id)) {
          return cbk([400, 'ExpectedIdentifyingBlockHashOfBlockToRetrieve']);
        }

        if (height !== undefined && !!id) {
          return cbk([400, 'ExpectedEitherHeightOrIdNotBoth']);
        }

        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedAuthenticatedLndToRetrieveBlock']);
        }

        return cbk();
      },

      // Get the best block in the chain to find the default block hash
      getTip: ['validate', ({}, cbk) => {
        // Exit early when a specific block is requested
        if (height !== undefined || !!id) {
          return cbk();
        }

        return lnd[type].getBestBlock({}, (err, res) => {
          if (!!err && err.details === errorUnknownMethod) {
            return cbk([501, 'GetBestBlockMethodNotSupported']);
          }

          if (!!err) {
            return cbk([503, 'UnexpectedErrorGettingBestBlock', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedResponseForBestBlockRequest']);
          }

          if (!isBuffer(res.block_hash)) {
            return cbk([503, 'ExpectedChainTipInfoInGetBestBlockResponse']);
          }

          return cbk(null, res.block_hash);
        });
      }],

      // Get the hash of the block to fetch
      getHash: ['getTip', ({getTip}, cbk) => {
        // Exit early when the hash to get is specified
        if (!!id) {
          return cbk(null, hexAsReversedBuffer(id));
        }

        // Exit early when the hash comes from the chain tip
        if (!!getTip) {
          return cbk(null, getTip);
        }

        return lnd[type].getBlockHash({block_height: height}, (err, res) => {
          if (!!err && err.details === errorUnknownMethod) {
            return cbk([501, 'GetBlockHashMethodNotSupported']);
          }

          if (!!err) {
            return cbk([503, 'UnexpectedErrorGettingBlockHash', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedResponseForGetBlockHashRequest']);
          }

          if (!isBuffer(res.block_hash)) {
            return cbk([503, 'ExpectedBlockHashInGetBlockHashResponse']);
          }

          return cbk(null, res.block_hash);
        });
      }],

      // Get the block
      getBlock: ['getHash', ({getHash}, cbk) => {
        return lnd[type][method]({block_hash: getHash}, (err, res) => {
          if (!!err && err.details === errorNotFound) {
            return cbk([404, 'BlockNotFound']);
          }

          if (!!err && err.details === errorUnknownMethod) {
            return cbk([501, 'GetBlockMethodNotSupported']);
          }

          if (!!err) {
            return cbk([503, 'UnexpectedErrorWhenGettingChainBlock', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedResponseForChainBlockRequest']);
          }

          if (!isBuffer(res.raw_block)) {
            return cbk([503, 'ExpectedRawBlockInChainBlockResponse']);
          }

          return cbk(null, {block: bufferAsHex(res.raw_block)});
        });
      }],
    },
    returnResult({reject, resolve, of: 'getBlock'}, cbk));
  });
};
