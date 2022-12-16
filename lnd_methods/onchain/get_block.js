const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const bufferAsHex = buffer => buffer.toString('hex');
const errorNotFound = '-5: Block not found';
const errorUnknownMethod = 'unknown service chainrpc.ChainKit';
const hexAsBuffer = hex => Buffer.from(hex, 'hex').reverse();
const {isBuffer} = Buffer;
const isHash = n => /^[0-9A-F]{64}$/i.test(n);
const method = 'getBlock';
const type = 'blocks';

/** Get a block in the chain

  This method requires LND built with `chainkit` build tag

  Requires `onchain:read` permission

  This method is not supported on LND 0.15.5 and below

  {
    id: <Block Hash Hex String>
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk or Promise
  {
    block: <Raw Block Bytes Hex String>
  }
*/
module.exports = ({id, lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isHash(id)) {
          return cbk([400, 'ExpectedIdentifyingBlockHashOfBlockToRetrieve']);
        }

        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedAuthenticatedLndToRetrieveBlock']);
        }

        return cbk();
      },

      // Get the block
      getBlock: ['validate', ({}, cbk) => {
        return lnd[type][method]({block_hash: hexAsBuffer(id)}, (err, res) => {
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
