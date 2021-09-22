const {test} = require('@alexbosworth/tap');

const {verifyAccess} = require('./../../../lnd_methods');

const makeArgs = overrides => {
  const args = {
    lnd: {
      default: {
        checkMacaroonPermissions: ({}, cbk) => cbk(null, {valid: true}),
      },
    },
    macaroon: Buffer.from('macaroon').toString('base64'),
    permissions: ['entity:action'],
  };

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const tests = [
  {
    args: makeArgs({lnd: undefined}),
    description: 'LND is required to verify access',
    error: [400, 'ExpectedAuthenticatedLndApiObjectToVerifyAccess'],
  },
  {
    args: makeArgs({macaroon: undefined}),
    description: 'A macaroon is required',
    error: [400, 'ExpectedMacaroonToVerifyAccess'],
  },
  {
    args: makeArgs({permissions: undefined}),
    description: 'Permissions to check are required',
    error: [400, 'ExpectedPermissionsArrayToVerifyAccess'],
  },
  {
    args: makeArgs({
      lnd: {
        default: {
          checkMacaroonPermissions: ({}, cbk) => cbk({details: 'unknown ser'}),
        },
      },
    }),
    description: 'Method not supported error returned',
    error: [501, 'VerifyAccessMethodNotSupported'],
  },
  {
    args: makeArgs({
      lnd: {
        default: {
          checkMacaroonPermissions: ({}, cbk) => cbk({
            details: 'permission denied',
          }),
        },
      },
    }),
    description: 'Method not supported error returned',
    expected: {is_valid: false},
  },
  {
    args: makeArgs({
      lnd: {default: {checkMacaroonPermissions: ({}, cbk) => cbk('err')}},
    }),
    description: 'Errors are passed back',
    error: [503, 'UnexpectedErrorFromCheckMacaroonMethod', {err: 'err'}],
  },
  {
    args: makeArgs({
      lnd: {default: {checkMacaroonPermissions: ({}, cbk) => cbk()}},
    }),
    description: 'A response is expected',
    error: [503, 'ExpectedResponseFromCheckMacaroonRequest'],
  },
  {
    args: makeArgs({
      lnd: {default: {checkMacaroonPermissions: ({}, cbk) => cbk(null, {})}},
    }),
    description: 'A valid attribute is expected',
    error: [503, 'ExpectedValidIndicatorInCheckMacaroonResponse'],
  },
  {
    args: makeArgs({}),
    description: 'Validity is returned',
    expected: {is_valid: true},
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, rejects, strictSame}) => {
    if (!!error) {
      await rejects(() => verifyAccess(args), error, 'Got expected error');
    } else {
      const res = await verifyAccess(args);

      strictSame(res, expected, 'Got expected result');
    }

    return end();
  });
});
