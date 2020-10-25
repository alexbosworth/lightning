const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const getWalletInfo = require('./../info/get_wallet_info');
const subscribeToBlocks = require('./../onchain/subscribe_to_blocks');

/** Lookup the current best block height

  LND with `chainrpc` build tag and `onchain:read` permission is suggested

  Otherwise, `info:read` permission is required

  {
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk or Promise
  {
    current_block_hash: <Best Chain Hash Hex String>
    current_block_height: <Best Chain Height Number>
  }
*/
module.exports = ({lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!lnd) {
          return cbk([400,  'ExpectedAuthenticatedLndToGetCurrrentHeight']);
        }

        return cbk();
      },

      // Try and get the latest block via the block subscription
      getHeight: ['validate', ({}, cbk) => {
        const sub = subscribeToBlocks({lnd});

        sub.once('error', err => cbk());

        sub.once('block', block => {
          sub.removeAllListeners();

          return cbk(null, {
            current_block_hash: block.id,
            current_block_height: block.height,
          });
        });

        return;
      }],

      // Get all node info if necessary
      getInfo: ['getHeight', ({getHeight}, cbk) => {
        // Exit early when the public key was already derived
        if (!!getHeight) {
          return cbk();
        }

        return getWalletInfo({lnd}, cbk);
      }],

      // The best chain block height of the backing LND node
      height: ['getHeight', 'getInfo', ({getHeight, getInfo}, cbk) => {
        const info = getHeight || getInfo;

        return cbk(null, {
          current_block_hash: info.current_block_hash,
          current_block_height: info.current_block_height,
        });
      }],
    },
    returnResult({reject, resolve, of: 'height'}, cbk));
  });
};
