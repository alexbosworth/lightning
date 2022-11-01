const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {addPeer} = require('./../peers');
const {isLnd} = require('./../../lnd_requests');

const defaultMinConfs = 1;
const defaultMinHtlcMtokens = '1';
const minChannelTokens = 20000;
const method = 'openChannel';
const type = 'default';

/** Open a new channel.

  The capacity of the channel is set with local_tokens

  If give_tokens is set, it is a gift and it does not alter the capacity

  Requires `offchain:write`, `onchain:write`, `peers:write` permissions

  External funding requires LND compiled with `walletrpc` build tag

  `base_fee_mtokens` is not supported on LND 0.15.4 and below
  `fee_rate` is not supported on LND 0.15.4 and below

  {
    [base_fee_mtokens]: <Routing Base Fee Millitokens Charged String>
    [chain_fee_tokens_per_vbyte]: <Chain Fee Tokens Per VByte Number>
    [cooperative_close_address]: <Restrict Cooperative Close To Address String>
    [fee_rate]: <Routing Fee Rate In Millitokens Per Million Number>
    [give_tokens]: <Tokens to Gift To Partner Number> // Defaults to zero
    [is_private]: <Channel is Private Bool> // Defaults to false
    lnd: <Authenticated LND API Object>
    local_tokens: <Total Channel Capacity Tokens Number>
    [min_confirmations]: <Spend UTXOs With Minimum Confirmations Number>
    [min_htlc_mtokens]: <Minimum HTLC Millitokens String>
    [partner_csv_delay]: <Peer Output CSV Delay Number>
    partner_public_key: <Public Key Hex String>
    [partner_socket]: <Peer Connection Host:Port String>
  }

  @returns via cbk or Promise
  {
    transaction_id: <Funding Transaction Id String>
    transaction_vout: <Funding Transaction Output Index Number>
  }
*/
module.exports = (args, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isLnd({method, type, lnd: args.lnd})) {
          return cbk([400, 'ExpectedLndForChannelOpen']);
        }

        if (!args.local_tokens) {
          return cbk([400, 'ExpectedLocalTokensNumberToOpenChannelWith']);
        }

        if (args.local_tokens < minChannelTokens) {
          return cbk([400, 'ExpectedLargerChannelSizeForChannelOpen']);
        }

        if (!args.partner_public_key) {
          return cbk([400, 'ExpectedPartnerPublicKeyForChannelOpen']);
        }

        return cbk();
      },

      // Connect to peer
      connect: ['validate', ({}, cbk) => {
        if (!args.partner_socket) {
          return cbk();
        }

        return addPeer({
          lnd: args.lnd,
          public_key: args.partner_public_key,
          socket: args.partner_socket,
        },
        cbk);
      }],

      // Determine the minimum confs for spend utxos
      minConfs: ['validate', ({}, cbk) => {
        if (args.min_confirmations === undefined) {
          return cbk(null, defaultMinConfs);
        }

        return cbk(null, args.min_confirmations);
      }],

      // Open the channel
      openChannel: ['connect', 'minConfs', ({minConfs}, cbk) => {
        let isAnnounced = false;

        const options = {
          base_fee: args.base_fee_mtokens || undefined,
          fee_rate: args.fee_rate,
          local_funding_amount: args.local_tokens,
          min_confs: minConfs,
          min_htlc_msat: args.min_htlc_mtokens || defaultMinHtlcMtokens,
          node_pubkey: Buffer.from(args.partner_public_key, 'hex'),
          private: !!args.is_private,
          remote_csv_delay: args.partner_csv_delay || undefined,
          spend_unconfirmed: !minConfs,
          use_base_fee: args.base_fee_mtokens !== undefined,
          use_fee_rate: args.fee_rate !== undefined,
        };

        if (!!args.chain_fee_tokens_per_vbyte) {
          options.sat_per_byte = args.chain_fee_tokens_per_vbyte;
        }

        if (!!args.cooperative_close_address) {
          options.close_address = args.cooperative_close_address;
        }

        if (!!args.give_tokens) {
          options.push_sat = args.give_tokens;
        }

        const channelOpen = args.lnd.default.openChannel(options);

        channelOpen.on('data', chan => {
          switch (chan.update) {
          case 'chan_open':
            break;

          case 'chan_pending':
            if (isAnnounced) {
              break;
            }

            isAnnounced = true;

            channelOpen.cancel();

            return cbk(null, {
              transaction_id: chan.chan_pending.txid.reverse().toString('hex'),
              transaction_vout: chan.chan_pending.output_index,
            });
            break;

          case 'confirmation':
            break;

          default:
            break;
          }
        });

        channelOpen.on('end', () => {});

        channelOpen.on('error', err => {});

        channelOpen.on('status', n => {
          if (isAnnounced) {
            return;
          }

          isAnnounced = true;

          channelOpen.removeAllListeners();

          if (!n || !n.details) {
            return cbk([503, 'UnknownChannelOpenStatus']);
          }

          if (/is.not.online/.test(n.details)) {
            return cbk([503, 'PeerIsNotOnline']);
          }

          if (/multiple.channels.unsupported/i.test(n.details)) {
            return cbk([503, 'RemoteNodeDoesNotSupportMultipleChannels']);
          }

          if (/not.enough.witness.outputs.to.create.funding/.test(n.details)) {
            return cbk([400, 'InsufficientFundsToCreateChannel', {err: n}]);
          }

          if (/disconnected$/.test(n.details)) {
            return cbk([503, 'RemotePeerDisconnected']);
          }

          if (/pending.channels.exceed.maximum/.test(n.details)) {
            return cbk([503, 'PeerPendingChannelsExceedMaximumAllowable']);
          }

          if (/^unknown.chain/i.test(n.details)) {
            return cbk([503, 'ChainUnsupported']);
          }

          switch (n.details.toLowerCase()) {
          case 'cannot open channel to self':
            return cbk([400, 'CannotOpenChannelToOwnNode']);

          case 'channels cannot be created before the wallet is fully synced':
            return cbk([503, 'WalletNotFullySynced']);

          case 'synchronizing blockchain':
            return cbk([503, 'RemoteNodeSyncing']);

          case 'unable to send funding request message: peer exiting':
            return cbk([503, 'RemotePeerExited']);

          default:
            return cbk([503, 'FailedToOpenChannel', {err: n.details}]);
          }
        });

        return;
      }],
    },
    returnResult({reject, resolve, of: 'openChannel'}, cbk));
  });
};
