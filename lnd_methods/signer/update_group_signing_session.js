const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const bufferAsHex = buffer => buffer.toString('hex');
const hexAsBuffer = hex => Buffer.from(hex, 'hex');
const {isArray} = Array;
const {isBuffer} = Buffer;
const isHash = n => !!n && /^[0-9A-F]{64}$/i.test(n);
const method = 'muSig2RegisterNonces';
const type = 'signer';

/** Update a MuSig2 signing session with nonces and generate a partial sig

  All remote nonces are expected to be passed

  Requires LND built with `signrpc` build tag

  Requires `signer:generate` permission

  This method is not supported in LND 0.14.5 and below

  {
    hash: <Hash to Sign Hex String>
    id: <MuSig2 Session Id Hex String>
    lnd: <Authenticated LND API Object>
    nonces: [<Nonce Hex String>]
  }

  @returns via cbk or Promise
  {
    signature: <Partial Signature Hex String>
  }
*/
module.exports = ({hash, id, lnd, nonces}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isHash(hash)) {
          return cbk([400, 'ExpectedHashToSignToUpdateMuSig2Session']);
        }

        if (!id) {
          return cbk([400, 'ExpectedSessionIdToUpdateMuSig2Session']);
        }

        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedAuthenticatedLndToUpdateMuSig2Session']);
        }

        if (!isArray(nonces)) {
          return cbk([400, 'ExpectedArrayOfNoncesToUpdateMuSig2Session']);
        }

        return cbk();
      },

      // Update the session with the nonces
      updateNonces: ['validate', ({}, cbk) => {
        return lnd[type][method]({
          other_signer_public_nonces: nonces.map(hexAsBuffer),
          session_id: hexAsBuffer(id),
        },
        (err, res) => {
          if (!!err) {
            return cbk([503, 'UnexpectedErrorUpdatingMuSig2Session', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedResultOfRegisterNoncesRequest']);
          }

          if (res.have_all_nonces !== true) {
            return cbk([400, 'ExpectedAllNoncesForRegisterNoncesRequest']);
          }

          return cbk();
        });
      }],

      // Partially sign the digest hash
      sign: ['updateNonces', ({}, cbk) => {
        return lnd[type].muSig2Sign({
          message_digest: hexAsBuffer(hash),
          session_id: hexAsBuffer(id),
        },
        (err, res) => {
          if (!!err) {
            return cbk([503, 'UnexpectedErrorSigningMuSig2Session', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedResultForMuSig2SignRequest']);
          }

          if (!isBuffer(res.local_partial_signature)) {
            return cbk([503, 'ExpectedPartialSignatureForMuSig2SignRequest']);
          }

          return cbk(null, {
            signature: bufferAsHex(res.local_partial_signature),
          });
        });
      }],
    },
    returnResult({reject, resolve, of: 'sign'}, cbk));
  });
};
