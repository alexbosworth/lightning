const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const addressFormats = require('./address_formats');
const {isLnd} = require('./../../lnd_requests');

const connectFailMessage = '14 UNAVAILABLE: Connect Failed';
const defaultAddressFormat = 'p2wpkh';
const method = 'newAddress';
const type = 'default';

/** Create a new receive address.

  Requires `address:write` permission

  LND 0.14.3 and below do not support p2tr addresses

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

      // Type
      type: ['validate', ({}, cbk) => {
        const format = args.format || defaultAddressFormat;

        if (!args.is_unused) {
          return cbk(null, addressFormats[format]);
        }

        return cbk(null, addressFormats[`unused_${format}`]);
      }],

      // Get the address
      createAddress: ['type', ({type}, cbk) => {
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
