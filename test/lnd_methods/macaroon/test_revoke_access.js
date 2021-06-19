const {test} = require('@alexbosworth/tap');

const {revokeAccess} = require('./../../../');

const id = '1';

const tests = [
  {
    args: {},
    description: 'An id is required to revoke access',
    error: [400, 'ExpectedPositiveMacaroonRootIdToRevoke'],
  },
  {
    args: {id},
    description: 'An LND Object is required to revoke access',
    error: [400, 'ExpectedAuthenticatedLndApiObjectToRevokeAccess'],
  },
  {
    args: {
      id,
      lnd: {default: {deleteMacaroonId: ({}, cbk) => cbk('err')}},
    },
    description: 'Errors from the RPC are relayed',
    error: [503, 'UnexpectedErrorFromRevokeMacaroon', {err: 'err'}],
  },
  {
    args: {
      id,
      lnd: {
        default: {
          deleteMacaroonId: ({}, cbk) => cbk({
            details: 'unknown method DeleteMacaroonID for service lnrpc.Lightning',
          }),
        },
      },
    },
    description: 'Not supported is returned',
    error: [501, 'RevokeAccessMethodNotSupported'],
  },
  {
    args: {
      id,
      lnd: {default: {deleteMacaroonId: ({}, cbk) => cbk()}},
    },
    description: 'A response is expected',
    error: [503, 'ExpectedResponseFromRevokeMacaroonRequest'],
  },
  {
    args: {
      id,
      lnd: {default: {deleteMacaroonId: ({}, cbk) => cbk(null, {})}},
    },
    description: 'Deletion confirmation is expected',
    error: [503, 'ExpectedDeletionConfirmationForRevokeMacaroon'],
  },
  {
    args: {
      id,
      lnd: {
        default: {
          deleteMacaroonId: (args, cbk) => {
            return cbk(null, {deleted: true});
          },
        },
      },
    },
    description: 'Macaroon revoked',
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, equal, rejects}) => {
    if (!!error) {
      await rejects(() => revokeAccess(args), error, 'Got expected error');
    } else {
      await revokeAccess(args);
    }

    return end();
  });
});
