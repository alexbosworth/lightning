const {randomBytes} = require('crypto');

const asyncAuto = require('async/auto');
const asyncMap = require('async/map');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const bufferFromHex = hex => Buffer.from(hex, 'hex');
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

  This method requires external funding of channels, which is not supported in
  LND versions 0.9.2 and below.

  After getting the addresses and tokens to fund, use fundChannels within ten
  minutes to fund the channels.

  If you do not fund the channels, be sure to cancelPendingChannel on each
  channel that was not funded.

  {
    channels: [{
      capacity: <Channel Capacity Tokens Number>
      [cooperative_close_address]: <Restrict Coop Close To Address String>
      [give_tokens]: <Tokens to Gift To Partner Number> // Defaults to zero
      [is_private]: <Channel is Private Bool> // Defaults to false
      [min_htlc_mtokens]: <Minimum HTLC Millitokens String>
      partner_public_key: <Public Key Hex String>
      [partner_csv_delay]: <Peer Output CSV Delay Number>
      [partner_socket]: <Peer Connection Host:Port String>
    }]
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
module.exports = ({channels, lnd}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isArray(channels)) {
          return cbk([400, 'ExpectedChannelsToOpenChannels']);
        }

        if (channels.filter(n => !!n).length !== channels.length) {
          return cbk([400, 'ExpectedChannelDetailsToOpenChannels']);
        }

        if (!!channels.find(n => !n.capacity)) {
          return cbk([400, 'ExpectedCapacityOfChannelsToOpenChannels']);
        }

        if (!!channels.find(n => !isPublicKey(n.partner_public_key))) {
          return cbk([400, 'ExpectedPeerPublicKeyToOpenChannels']);
        }

        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedAuthenticatedLndToOpenChannels']);
        }

        return cbk();
      },

      // Open channels
      openChannels: ['validate', ({}, cbk) => {
        return asyncMap(channels, (channel, cbk) => {
          const id = makeId();
          let isDone = false;

          const channelOpen = lnd[type][method]({
            funding_shim: {psbt_shim: {pending_chan_id: id}},
            local_funding_amount: channel.capacity,
            node_pubkey: bufferFromHex(channel.partner_public_key),
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
            // On LND 0.9.2 and below, the PSBT shim will not be recognized
            if (!!err.details && err.details.startsWith(notEnoughOutputs)) {
              return done([503, 'InsufficientBalanceToOpenChannels', {err}]);
            }

            return done([503, 'UnexpectedErrorOpeningChannels', {err}]);
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
              address: data.psbt_fund.funding_address,
              id: hexFromBuffer(id),
              tokens: Number(data.psbt_fund.funding_amount),
            });
          });
        },
        cbk);
      }],

      // Fund addresses with tokens
      fund: ['openChannels', ({openChannels}, cbk) => {
        return cbk(null, {pending: openChannels});
      }],
    },
    returnResult({reject, resolve, of: 'fund'}, cbk));
  });
};
