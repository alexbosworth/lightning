const {randomBytes} = require('crypto');

const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {getPublicKey} = require('./../address');
const {isLnd} = require('./../../lnd_requests');

const family = 0;
const hexAsBuffer = hex => Buffer.from(hex, 'hex');
const makeId = () => randomBytes(32).toString('hex');
const maxCooperativeCloseDelay = 5e4;
const method = 'fundingStateStep';
const type = 'default';

/** Prepare for a channel proposal

  Channel proposals can be made with `propose_channel`. Channel proposals can
  allow for cooperative close delays or external funding flows.

  Requires `offchain:write`, `onchain:write` permissions

  {
    [cooperative_close_delay]: <Cooperative Close Relative Delay Number>
    [id]: <Pending Id Hex String>
    key_index: <Channel Funding Output Multisig Local Key Index Number>
    lnd: <Authenticated LND API Object>
    remote_key: <Channel Funding Partner Multisig Public Key Hex String>
    transaction_id: <Funding Output Transaction Id Hex String>
    transaction_vout: <Funding Output Transaction Output Index Number>
  }

  @returns via cbk or Promise
  {
    id: <Pending Channel Id Hex String>
  }
*/
module.exports = (args, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (args.cooperative_close_delay > maxCooperativeCloseDelay) {
          return cbk([400, 'ExpectedRelativeBlockHeightCloseDelayForChannel']);
        }

        if (args.key_index === undefined) {
          return cbk([400, 'ExpectedMultiSigKeyIndexForFutureOpenChannel']);
        }

        if (!isLnd({method, type, lnd: args.lnd})) {
          return cbk([400, 'ExpectedAuthenticatedLndToPrepareForChannel']);
        }

        if (!args.remote_key) {
          return cbk([400, 'ExpectedRemoteMultiSigPublicKeyToChannelPrepare']);
        }

        if (!args.transaction_id) {
          return cbk([400, 'ExpectedFundingTransactionIdToPrepareForChannel']);
        }

        if (args.transaction_vout === undefined) {
          return cbk([400, 'ExpectedFundingTxOutputIndexToPrepareForChannel']);
        }

        return cbk();
      },

      // Get the wallet key
      getKey: ['validate', ({}, cbk) => {
        return getPublicKey({
          family,
          lnd: args.lnd,
          index: args.key_index,
        },
        cbk);
      }],

      // Prepare for the channel
      prepare: ['getKey', ({getKey}, cbk) => {
        const id = args.id || makeId();

        return args.lnd[type][method]({
          shim_register: {
            chan_point_shim: {
              chan_point: {
                funding_txid_bytes: hexAsBuffer(args.transaction_id).reverse(),
                output_index: args.transaction_vout,
              },
              local_key: {
                raw_key_bytes: hexAsBuffer(getKey.public_key),
                key_loc: {key_index: args.key_index},
              },
              remote_key: hexAsBuffer(args.remote_key),
              pending_chan_id: hexAsBuffer(id),
              thaw_height: args.cooperative_close_delay || undefined,
            },
          },
        },
        err => {
          if (!!err) {
            return cbk([503, 'UnexpectedErrorPreparingForChanPropose', {err}]);
          }

          return cbk(null, {id});
        });
      }],
    },
    returnResult({reject, resolve, of: 'prepare'}, cbk));
  });
};
