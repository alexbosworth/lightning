const {test} = require('@alexbosworth/tap');

const {getMethods} = require('./../../../');

const makeLnd = ({err, res}) => {
  const response = {
    method_permissions: {
      '/path': {permissions: [{action: 'action', entity: 'entity'}]},
    },
  };

  const r = res !== undefined ? res : response;

  return {default: {listPermissions: ({}, cbk) => cbk(err, r)}};
};

const tests = [
  {
    args: {},
    description: 'LND is required to get method permissions',
    error: [400, 'ExpectedAuthenticatedLndApiObjectToGetMethods'],
  },
  {
    args: {lnd: makeLnd({err: {details: 'unknown service lnrpc.Lightning'}})},
    description: 'Method unsupported error returns error code',
    error: [501, 'ListPermissionsMethodNotSupported'],
  },
  {
    args: {lnd: makeLnd({err: 'err'})},
    description: 'Unexpected error returns error',
    error: [503, 'UnexpectedErrInListPermissionsResponse', {err: 'err'}],
  },
  {
    args: {lnd: makeLnd({res: null})},
    description: 'A response is expected',
    error: [503, 'ExpectedResponseForListPermissionsRequest'],
  },
  {
    args: {lnd: makeLnd({res: {}})},
    description: 'A response with permissions is expected',
    error: [503, 'ExpectedPermissionsForListPermissionsRequest'],
  },
  {
    args: {lnd: makeLnd({res: {method_permissions: {}}})},
    description: 'A response with some methods is expected',
    error: [503, 'ExpectedMethodsForListPermissionsRequest'],
  },
  {
    args: {
      lnd: makeLnd({res: {method_permissions: {foo: null}}})
    },
    description: 'A response with method details is expected',
    error: [503, 'ExpectedMethodDataForListPermissionsRequest'],
  },
  {
    args: {
      lnd: makeLnd({res: {method_permissions: {foo: {}}}})
    },
    description: 'A response with method permissions is expected',
    error: [503, 'ExpectedArrayOfPermissionsForMethodInList'],
  },
  {
    args: {lnd: makeLnd({})},
    description: 'Supported methods and permissions are returned',
    expected: {methods: [{endpoint: '/path', permissions: ['entity:action']}]},
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, rejects, strictSame}) => {
    if (!!error) {
      await rejects(() => getMethods(args), error, 'Got error');
    } else {
      strictSame(await getMethods(args), expected, 'Got expected res');
    }

    return end();
  });
});
