const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const bufferAsHex = buffer => buffer.toString('hex');
const hexAsBuffer = hex => Buffer.from(hex, 'hex');
const isHex = n => !!n && !(n.length % 2) && /^[0-9A-F]*$/i.test(n);
const method = 'signMessage';
const type = 'signer';
const unimplementedError = '12 UNIMPLEMENTED: unknown service signrpc.Signer';

/** Sign a sha256 hash of arbitrary bytes

  Requires LND built with `signrpc` build tag

  Requires `signer:generate` permission

  {
    key_family: <Key Family Number>
    key_index: <Key Index Number>
    lnd: <Authenticated LND API Object>
    preimage: <Bytes To Hash and Sign Hex Encoded String>
  }

  @returns via cbk or Promise
  {
    signature: <Signature Hex String>
  }
*/
module.exports = (args, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (args.key_family === undefined) {
          return cbk([400, 'ExpectedKeyFamilyToSignBytes']);
        }

        if (args.key_index === undefined) {
          return cbk([400, 'ExpectedKeyIndexToSignBytes']);
        }

        if (!isLnd({method, type, lnd: args.lnd})) {
          return cbk([400, 'ExpectedLndToSignBytes']);
        }

        if (!isHex(args.preimage)) {
          return cbk([400, 'ExpectedHexDataToSignBytes']);
        }

        return cbk();
      },

      // Get signature
      signBytes: ['validate', ({}, cbk) => {
        return args.lnd[type][method]({
          key_loc: {key_family: args.key_family, key_index: args.key_index},
          msg: hexAsBuffer(args.preimage),
        },
        (err, res) => {
          if (!!err && err.message === unimplementedError) {
            return cbk([400, 'ExpectedSignerRpcLndBuildTagToSignBytes']);
          }

          if (!!err) {
            return cbk([503, 'UnexpectedErrorWhenSigningBytes', {err}]);
          }

          if (!res) {
            return cbk([503, 'UnexpectedEmptyResponseWhenSigningBytes']);
          }

          if (!res.signature) {
            return cbk([503, 'ExpectedSignatureInSignMessageResponse']);
          }

          if (!res.signature.length) {
            return cbk([503, 'ExpectedSignatureInSignBytesResponse']);
          }

          return cbk(null, {signature: bufferAsHex(res.signature)});
        });
      }],
    },
    returnResult({reject, resolve, of: 'signBytes'}, cbk));
  });
};
