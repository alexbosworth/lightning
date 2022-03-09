const EventEmitter = require('events');

const {test} = require('@alexbosworth/tap');

const {openChannels} = require('./../../../lnd_methods');

const emitter = new EventEmitter();
const nodeKey1 = Buffer.alloc(33).toString('hex');
const nodeKey2 = Buffer.alloc(33, 2).toString('hex');

const makeChannels = ({}) => {
  return [{
    capacity: 1,
    partner_public_key: Buffer.alloc(33).toString('hex'),
  }];
};

const makeLnd = ({data, error}) => {
  return {
    default: {
      fundingStateStep: ({}, cbk) => cbk(),
      openChannel: ({}) => {
        const eventEmitter = new EventEmitter();

        if (!!error) {
          process.nextTick(() => eventEmitter.emit('error', error));
        } else if (data !== undefined) {
          process.nextTick(() => eventEmitter.emit('data', data));
        } else {
          process.nextTick(() => {
            eventEmitter.emit('data', {});

            eventEmitter.emit('data', {
              psbt_fund: {
                funding_address: 'funding_address',
                funding_amount: '1',
              },
              update: 'psbt_fund',
            });

            // Emit twice to make sure that cbk isn't called twice
            eventEmitter.emit('data', {
              psbt_fund: {
                funding_address: 'funding_address',
                funding_amount: '1',
              },
              update: 'psbt_fund',
            });
          });
        }

        return eventEmitter;
      },
    },
  };
};

const tests = [
  {
    args: {},
    description: 'An array of channels to open is expected',
    error: [400, 'ExpectedChannelsToOpenChannels'],
  },
  {
    args: {channels: [null]},
    description: 'Channel details must be provided',
    error: [400, 'ExpectedChannelDetailsToOpenChannels'],
  },
  {
    args: {channels: [{}]},
    description: 'Channel capacity must be specified',
    error: [400, 'ExpectedCapacityOfChannelsToOpenChannels'],
  },
  {
    args: {channels: [{capacity: 1}]},
    description: 'Channel partner public keys must be specified',
    error: [400, 'ExpectedPeerPublicKeyToOpenChannels'],
  },
  {
    args: {
      channels: [{
        capacity: 1,
        partner_public_key: Buffer.alloc(33).toString('hex'),
      }],
    },
    description: 'LND is required to open channels',
    error: [400, 'ExpectedAuthenticatedLndToOpenChannels'],
  },
  {
    args: {channels: makeChannels({}), lnd: makeLnd({error: 'err'})},
    description: 'Random error returns an error',
    error: [503, 'UnexpectedErrorOpeningChannels', {err: 'err'}],
  },
  {
    args: {channels: makeChannels({}), lnd: makeLnd({data: null})},
    description: 'Data is expected in data event',
    error: [503, 'ExpectedDataEventWhenOpeningChannels'],
  },
  {
    args: {
      channels: makeChannels({}),
      lnd: makeLnd({data: {update: 'psbt_fund'}}),
    },
    description: 'PSBT fund is expected in data event',
    error: [503, 'ExpectedPsbtFundInOpenChannelResponse'],
  },
  {
    args: {
      channels: makeChannels({}),
      lnd: makeLnd({data: {psbt_fund: {}, update: 'psbt_fund'}}),
    },
    description: 'PSBT fund address is expected in data event',
    error: [503, 'ExpectedFundAddressInOpenChannelResponse'],
  },
  {
    args: {
      channels: makeChannels({}),
      lnd: makeLnd({
        data: {
          psbt_fund: {funding_address: 'funding_address'},
          update: 'psbt_fund',
        },
      }),
    },
    description: 'PSBT fund amount is expected in data event',
    error: [503, 'ExpectedFundAmountInOpenChannelResponse'],
  },
  {
    args: {channels: makeChannels({}), lnd: makeLnd({})},
    description: 'Channels are pending',
    expected: {pending: {address: 'funding_address', tokens: 1}},
  },
  {
    args: {
      channels: [
        {capacity: 1, partner_public_key: nodeKey1},
        {capacity: 2, partner_public_key: nodeKey2},
      ],
      lnd: {
        default: {
          fundingStateStep: ({}, cbk) => cbk(),
          openChannel: args => {
            const eventEmitter = new EventEmitter();

            const key = args.node_pubkey.toString('hex');

            if (key === nodeKey1 && !args.funding_shim.psbt_shim.no_publish) {
              throw new Error('ExpectedFirstKeyIsNoPublish');
            }

            if (key === nodeKey2 && !!args.funding_shim.psbt_shim.no_publish) {
              throw new Error('TheSecondChannelShouldPublish');
            }

            process.nextTick(() => {
              eventEmitter.emit('data', {});

              eventEmitter.emit('data', {
                psbt_fund: {
                  funding_address: 'funding_address',
                  funding_amount: '1',
                },
                update: 'psbt_fund',
              });

              // Emit twice to make sure that cbk isn't called twice
              eventEmitter.emit('data', {
                psbt_fund: {
                  funding_address: 'funding_address',
                  funding_amount: '1',
                },
                update: 'psbt_fund',
              });
            });

            return eventEmitter;
          },
        },
      },
    },
    description: 'Multiple channels are pending',
    expected: {pending: {address: 'funding_address', tokens: 1}},
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, equal, rejects, match}) => {
    if (!!error) {
      await rejects(openChannels(args), error, 'Got error');
    } else {
      const {pending} = await openChannels(args);

      const [channel] = pending;

      equal(channel.address, expected.pending.address, 'Got funding address');
      equal(channel.id.length, 64, 'Got expected pending id');
      equal(channel.tokens, expected.pending.tokens, 'Got funding tokens');
    }

    return end();
  });
});
