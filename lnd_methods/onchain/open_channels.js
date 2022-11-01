const {randomBytes} = require('crypto');

const asyncAuto = require('async/auto');
const asyncEach = require('async/each');
const asyncMap = require('async/map');
const {returnResult} = require('asyncjs-util');

const cancelPendingChannel = require('./cancel_pending_channel');
const {isLnd} = require('./../../lnd_requests');

const anchors = 'ANCHORS';
const bufferFromHex = hex => Buffer.from(hex, 'hex');
const defaultMinHtlcMtokens = '1';
const fundEvent = 'psbt_fund';
const hexFromBuffer = buffer => buffer.toString('hex');
const {isArray} = Array;
const isPublicKey = n => /^[0-9A-F]{66}$/i.test(n);
const makeId = () => randomBytes(32);
const method = 'openChannel';
const notEnoughOutputs = 'not enough witness outputs to create funding';
const type = 'default';

/** Open one or more channels

  Requires `offchain:write`, `onchain:write` permissions

  After getting the addresses and tokens to fund, use `fundPendingChannels`
  within ten minutes to fund the channels.

  If you do not fund the channels, be sure to `cancelPendingChannel` on each
  channel that was not funded.

  Use `is_avoiding_broadcast` only when self-publishing the raw transaction
  after the funding step.

  `is_trusted_funding` is not supported on LND 0.15.0 and below and requires
  `--protocol.option-scid-alias` and `--protocol.zero-conf` set on both sides
  as well as a channel open request listener to accept the trusted funding.

  `base_fee_mtokens` is not supported on LND 0.15.4 and below
  `fee_rate` is not supported on LND 0.15.4 and below

  {
    channels: [{
      [base_fee_mtokens]: <Routing Base Fee Millitokens Charged String>
      capacity: <Channel Capacity Tokens Number>
      [cooperative_close_address]: <Restrict Coop Close To Address String>
      [fee_rate]: <Routing Fee Rate In Millitokens Per Million Number>
      [give_tokens]: <Tokens to Gift To Partner Number> // Defaults to zero
      [is_private]: <Channel is Private Bool> // Defaults to false
      [is_trusted_funding]: <Peer Should Avoid Waiting For Confirmation Bool>
      [min_htlc_mtokens]: <Minimum HTLC Millitokens String>
      [partner_csv_delay]: <Peer Output CSV Delay Number>
      partner_public_key: <Public Key Hex String>
    }]
    [is_avoiding_broadcast]: <Avoid Broadcast of All Channels Bool>
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk or Promise
  {
    pending: [{
      address: <Address To Send To String>
      id: <Pending Channel Id Hex String>
      tokens: <Tokens to Send Number>
    }]
  }
*/
module.exports = (args, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isArray(args.channels)) {
          return cbk([400, 'ExpectedChannelsToOpenChannels']);
        }

        if (args.channels.filter(n => !!n).length !== args.channels.length) {
          return cbk([400, 'ExpectedChannelDetailsToOpenChannels']);
        }

        if (!!args.channels.find(n => !n.capacity)) {
          return cbk([400, 'ExpectedCapacityOfChannelsToOpenChannels']);
        }

        if (!!args.channels.find(n => !isPublicKey(n.partner_public_key))) {
          return cbk([400, 'ExpectedPeerPublicKeyToOpenChannels']);
        }

        if (!isLnd({method, type, lnd: args.lnd})) {
          return cbk([400, 'ExpectedAuthenticatedLndToOpenChannels']);
        }

        return cbk();
      },

      // Channels to open
      toOpen: ['validate', ({}, cbk) => {
        return cbk(null, args.channels.map(channel => ({
          base_fee_mtokens: channel.base_fee_mtokens,
          capacity: channel.capacity,
          fee_rate: channel.fee_rate,
          id: makeId(),
          cooperative_close_address: channel.cooperative_close_address,
          give_tokens: channel.give_tokens,
          is_private: channel.is_private,
          is_trusted_funding: channel.is_trusted_funding,
          min_htlc_mtokens: channel.min_htlc_mtokens,
          partner_public_key: channel.partner_public_key,
          partner_csv_delay: channel.partner_csv_delay,
        })));
      }],

      // Open channels
      openChannels: ['toOpen', ({toOpen}, cbk) => {
        const [lastChannel] = toOpen.map(n => n.id).reverse();

        return asyncMap(toOpen, (channel, cbk) => {
          let isDone = false;
          const isSelfPublish = !!args.is_avoiding_broadcast;

          const channelOpen = args.lnd[type][method]({
            base_fee: channel.base_fee_mtokens || undefined,
            close_address: channel.cooperative_close_address || undefined,
            commitment_type: channel.is_trusted_funding ? anchors : undefined,
            fee_rate: channel.fee_rate,
            funding_shim: {
              psbt_shim: {
                no_publish: !!isSelfPublish || !channel.id.equals(lastChannel),
                pending_chan_id: channel.id,
              },
            },
            local_funding_amount: channel.capacity,
            min_htlc_msat: channel.min_htlc_mtokens || defaultMinHtlcMtokens,
            node_pubkey: bufferFromHex(channel.partner_public_key),
            private: !!channel.is_private,
            push_sat: channel.give_tokens || undefined,
            remote_csv_delay: channel.partner_csv_delay || undefined,
            scid_alias: channel.is_trusted_funding && channel.is_private,
            use_base_fee: channel.base_fee_mtokens !== undefined,
            use_fee_rate: channel.fee_rate !== undefined,
            zero_conf: channel.is_trusted_funding || undefined,
          });

          const done = (err, res) => {
            // Channel open already started
            if (isDone) {
              return;
            }

            isDone = true;

            return cbk(err, res);
          }

          channelOpen.on('error', err => {
            return done(null, {err});
          });

          channelOpen.on('data', data => {
            if (!data) {
              return done([503, 'ExpectedDataEventWhenOpeningChannels']);
            }

            if (data.update !== fundEvent) {
              return;
            }

            if (!data.psbt_fund) {
              return done([503, 'ExpectedPsbtFundInOpenChannelResponse']);
            }

            if (!data.psbt_fund.funding_address) {
              return done([503, 'ExpectedFundAddressInOpenChannelResponse']);
            }

            if (!data.psbt_fund.funding_amount) {
              return done([503, 'ExpectedFundAmountInOpenChannelResponse']);
            }

            return done(null, {
              pending: {
                address: data.psbt_fund.funding_address,
                id: hexFromBuffer(channel.id),
                tokens: Number(data.psbt_fund.funding_amount),
              },
            });
          });
        },
        cbk);
      }],

      // Cancel all pending channels on failure
      cancelFailures: [
        'openChannels',
        'toOpen',
        ({openChannels, toOpen}, cbk) =>
      {
        const failedOpen = openChannels.find(n => !!n.err);

        // Exit early when there is no error opening channels
        if (!failedOpen) {
          return cbk();
        }

        const {err} = failedOpen;

        return asyncEach(toOpen, (channel, cbk) => {
          const id = hexFromBuffer(channel.id);

          return cancelPendingChannel({id, lnd: args.lnd}, () => cbk());
        },
        () => {
          return cbk([503, 'UnexpectedErrorOpeningChannels', {err}]);
        });
      }],

      // Fund addresses with tokens
      fund: ['openChannels', ({openChannels}, cbk) => {
        return cbk(null, {pending: openChannels.map(n => n.pending)});
      }],
    },
    returnResult({reject, resolve, of: 'fund'}, cbk));
  });
};
