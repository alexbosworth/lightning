const bufferAsHex = buffer => buffer.toString('hex');
const {isBuffer} = Buffer;
const typeConfirmation = 'confirmation';
const typeReorg = 'reorg';

/** Map an RPC confirmation message to a confirmation event

  {
    [conf]: {
      block_hash: <Block Hash Buffer Object>
      block_height: <Block Height Number>
      raw_tx: <Raw Transaction Bytes Buffer Object>
    }
    [reorg]: {}
  }

  @returns
  {
    [data]: {
      [block]: <Block Id Hex String>
      [height]: <Block Height Number>
      [transaction]: <Raw Transaction Hex String>
    }
    [type]: <Event Type String>
  }
*/
module.exports = args => {
  if (!args) {
    throw new Error('ExpectedDataForConfEvent');
  }

  // Exit early when there is a reorg
  if (!!args.reorg) {
    return {type: typeReorg};
  }

  // Exit early when there is no confirmation
  if (!args.conf) {
    return {};
  }

  if (!isBuffer(args.conf.block_hash)) {
    throw new Error('ExpectedConfirmationBlockHash');
  }

  if (!args.conf.block_height) {
    throw new Error('ExpectedConfirmationHeight');
  }

  if (!isBuffer(args.conf.raw_tx)) {
    throw new Error('ExpectedRawTxInAddressConf');
  }

  return {
    type: typeConfirmation,
    data: {
      block: bufferAsHex(args.conf.block_hash),
      height: args.conf.block_height,
      transaction: bufferAsHex(args.conf.raw_tx),
    },
  };
};
