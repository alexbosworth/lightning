const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const bufferAsHex = buffer => buffer.toString('hex');
const defaultType = 'ecdsa';
const hexAsBuffer = hex => Buffer.from(hex, 'hex');
const isHex = n => !!n && !(n.length % 2) && /^[0-9A-F]*$/i.test(n);
const isSchnorrSig = signature => signature.length === 64;
const isString = n => typeof n === 'string';
const method = 'signMessage';
const type = 'signer';
const types = {ecdsa: 'ecdsa', schnorr: 'schnorr'};
const unimplementedError = '12 UNIMPLEMENTED: unknown service signrpc.Signer';
const utf8AsBuffer = utf8 => Buffer.from(utf8, 'utf8');

/** Sign a sha256 hash of arbitrary bytes

  Supported signature types: `ecdsa`, `schnorr`

  Requires LND built with `signrpc` build tag

  Requires `signer:generate` permission

  `schnorr` signature type is not supported on LND 0.15.0 and below

  `tag` is not supported on LND 0.17.5 and below and requires `schnorr` type

  {
    key_family: <Key Family Number>
    key_index: <Key Index Number>
    lnd: <Authenticated LND API Object>
    preimage: <Bytes To Hash and Sign Hex Encoded String>
    [tag]: <BIP-340 Tagged Hash Tag UTF8 String>
    [type]: <Signature Type String>
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

        if (!!args.type && !types[args.type]) {
          return cbk([400, 'ExpectedKnownSignatureTypeToSignBytes']);
        }

        if (args.tag !== undefined && (!isString(args.tag) || !args.tag)) {
          return cbk([400, 'ExpectedNonEmptyTagStringToSignBytes']);
        }

        if (!!args.tag && args.type !== types.schnorr) {
          return cbk([400, 'ExpectedSchnorrSignatureTypeToSignTaggedBytes']);
        }

        return cbk();
      },

      // Get signature
      signBytes: ['validate', ({}, cbk) => {
        return args.lnd[type][method]({
          key_loc: {key_family: args.key_family, key_index: args.key_index},
          msg: hexAsBuffer(args.preimage),
          schnorr_sig: args.type === types.schnorr || undefined,
          tag: !!args.tag ? utf8AsBuffer(args.tag) : undefined,
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

          if (args.type === types.schnorr && !isSchnorrSig(res.signature)) {
            return cbk([503, 'UnexpectedSignatureLengthInSignBytesResponse']);
          }

          return cbk(null, {signature: bufferAsHex(res.signature)});
        });
      }],
    },
    returnResult({reject, resolve, of: 'signBytes'}, cbk));
  });
};
