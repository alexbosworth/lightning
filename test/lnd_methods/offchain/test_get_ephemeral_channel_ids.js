const {test} = require('@alexbosworth/tap');

const {getEphemeralChannelIds} = require('./../../../lnd_methods');

const makeLnd = ({err, res}) => {
  const response = {alias_maps: [{aliases: ['1', '2'], base_scid: '1'}]};

  const r = res !== undefined ? res : response;

  return {default: {listAliases: ({}, cbk) => cbk(err, r)}};
};

const tests = [
  {
    args: {},
    description: 'LND object is required',
    error: [400, 'ExpectedAuthenticatedLndToGetChannelIds'],
  },
  {
    args: {lnd: makeLnd({err: {details: 'unknown'}})},
    description: 'Not supported error is returned',
    error: [501, 'ListAliasesMethodNotSupported'],
  },
  {
    args: {lnd: makeLnd({err: 'err'})},
    description: 'Unknown error is returned',
    error: [503, 'UnexpectedGetChannelIdsError', {err: 'err'}],
  },
  {
    args: {lnd: makeLnd({res: null})},
    description: 'A response is expected',
    error: [503, 'ExpectedChannelMapsArray'],
  },
  {
    args: {lnd: makeLnd({res: {}})},
    description: 'A response array is expected',
    error: [503, 'ExpectedChannelMapsArray'],
  },
  {
    args: {lnd: makeLnd({res: {alias_maps: [{}]}})},
    description: 'Alias maps array is expected',
    error: [503, 'ExpectedArrayOfAliasesInAliasMap'],
  },
  {
    args: {lnd: makeLnd({res: {alias_maps: [{aliases: []}]}})},
    description: 'A base scid is expected',
    error: [503, 'ExpectedBaseScidInAliasMap'],
  },
  {
    args: {lnd: makeLnd({})},
    description: 'Channel ids are returned',
    expected: {channels: [{other_ids: ['0x0x2'], reference_id: '0x0x1'}]},
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, rejects, strictSame}) => {
    if (!!error) {
      await rejects(getEphemeralChannelIds(args), error, 'Got expected error');
    } else {
      const res = await getEphemeralChannelIds(args);

      strictSame(res, expected, 'Got expected result');
    }

    return end();
  });
});
