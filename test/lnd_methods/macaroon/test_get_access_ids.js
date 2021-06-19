const {test} = require('@alexbosworth/tap');

const {getAccessIds} = require('./../../../');

const unknown = {
  details: 'unknown method ListMacaroonIDs for service lnrpc.Lightning'
};

const tests = [
  {
    args: {},
    description: 'LND is required to get access ids',
    error: [400, 'ExpectedAuthenticatedLndApiObjectToGetAccessIds'],
  },
  {
    args: {lnd: {default: {listMacaroonIDs: ({}, cbk) => cbk('err')}}},
    description: 'Errors are passed back from LND',
    error: [503, 'UnexpectedErrorInListRootIdsResponse', {err: 'err'}],
  },
  {
    args: {lnd: {default: {listMacaroonIDs: ({}, cbk) => cbk(unknown)}}},
    description: 'Not supported is returned',
    error: [501, 'ListRootMacaroonIdsMethodNotSupported'],
  },
  {
    args: {lnd: {default: {listMacaroonIDs: ({}, cbk) => cbk()}}},
    description: 'A response is expected',
    error: [503, 'ExpectedResponseForListMacaroonRootIdsRequest'],
  },
  {
    args: {lnd: {default: {listMacaroonIDs: ({}, cbk) => cbk(null, {})}}},
    description: 'An array of ids is expected',
    error: [503, 'ExpectedArrayOfRootKeyIdsInListIdsResponse'],
  },
  {
    args: {
      lnd: {
        default: {
          listMacaroonIDs: ({}, cbk) => cbk(null, {root_key_ids: [null]})
        },
      },
    },
    description: 'An array of non-null ids is expected',
    error: [503, 'UnexpectedEmptyMacarootRootIdInListResponse'],
  },
  {
    args: {
      lnd: {
        default: {
          listMacaroonIDs: (args, cbk) => {
            return cbk(null, {root_key_ids: ['0']});
          },
        },
      },
    },
    description: 'Access key ids are returned',
    expected: {ids: ['0']},
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, rejects, strictSame}) => {
    if (!!error) {
      await rejects(() => getAccessIds(args), error, 'Got expected error');
    } else {
      const {ids} = await getAccessIds(args);

      strictSame(ids, expected.ids, 'Got expected ids');
    }

    return end();
  });
});
