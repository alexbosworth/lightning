const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const addressFormats = require('./address_formats');
const {isLnd} = require('./../../lnd_requests');

const connectFailMessage = '14 UNAVAILABLE: Connect Failed';
const defaultAddressFormat = 'p2wpkh';
const {isArray} = Array;
const isNeedingDerivationsCheck = format => format === 'p2tr';
const isTrSupported = n => !!n.find(n => n.address_type === 'TAPROOT_PUBKEY');
const method = 'newAddress';
const notSupported = /unknown.*walletrpc.WalletKit/;
const type = 'default';

/** Create a new receive address.

  Requires `address:write` permission

  LND 0.14.5 and below do not support p2tr addresses

  {
    [format]: <Receive Address Type String> // "np2wpkh" || "p2tr" || "p2wpkh"
    [is_unused]: <Get As-Yet Unused Address Bool>
    lnd: <Authenticated LND API Object>
  }

  @returns via cbk or Promise
  {
    address: <Chain Address String>
  }
*/
module.exports = (args, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!!args.format && addressFormats[args.format] === undefined) {
          return cbk([400, 'ExpectedKnownAddressFormat']);
        }

        if (!isLnd({method, type, lnd: args.lnd})) {
          return cbk([400, 'ExpectedLndForAddressCreation']);
        }

        return cbk();
      },

      // Get account derivations to confirm P2TR support
      checkFormat: ['validate', ({}, cbk) => {
        // Exit early when there is no need to check the derivations
        if (!isNeedingDerivationsCheck(args.format)) {
          return cbk();
        }

        return args.lnd.wallet.listAccounts({}, (err, res) => {
          if (!!err && notSupported.test(err.details)) {
            return cbk([501, 'CreationOfTaprootAddressesUnsupported']);
          }

          if (!!err) {
            return cbk([503, 'UnexpectedErrorCheckingTaprootSupport', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedResultForDerivationPathsRequest']);
          }

          if (!isArray(res.accounts)) {
            return cbk([503, 'ExpectedAccountsInDerivationPathsResult']);
          }

          if (!isTrSupported(res.accounts)) {
            return cbk([501, 'ExpectedTaprootSupportingLndToCreateAddress']);
          }

          return cbk();
        });
      }],

      // Type
      type: ['validate', ({}, cbk) => {
        const format = args.format || defaultAddressFormat;

        if (!args.is_unused) {
          return cbk(null, addressFormats[format]);
        }

        return cbk(null, addressFormats[`unused_${format}`]);
      }],

      // Get the address
      createAddress: ['checkFormat', 'type', ({type}, cbk) => {
        return args.lnd.default.newAddress({type}, (err, res) => {
          if (!!err && err.message === connectFailMessage) {
            return cbk([503, 'FailedToConnectToDaemonToCreateChainAddress']);
          }

          if (!!err) {
            return cbk([503, 'UnexpectedErrorCreatingAddress', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedResponseForAddressCreation']);
          }

          if (!res.address) {
            return cbk([503, 'ExpectedAddressInCreateAddressResponse']);
          }

          return cbk(null, {address: res.address});
        });
      }],
    },
    returnResult({reject, resolve, of: 'createAddress'}, cbk));
  });
};
