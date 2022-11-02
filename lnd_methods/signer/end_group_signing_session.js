const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const {isLnd} = require('./../../lnd_requests');

const bufferAsHex = buffer => buffer.toString('hex');
const hexAsBuffer = hex => Buffer.from(hex, 'hex');
const {isArray} = Array;
const {isBuffer} = Buffer;
const method = 'muSig2CombineSig';
const type = 'signer';

/** Complete a MuSig2 signing session

  Requires LND built with `signrpc` build tag

  Requires `signer:generate` permission

  This method is not supported in LND 0.14.5 and below

  {
    id: <Session Id Hex String>
    lnd: <Authenticated LND API Object>
    [signatures]: [<Combine External Partial Signature Hex String>]
  }

  @returns via cbk or Promise
  {
    [signature]: <Combined Signature Hex String>
  }
*/
module.exports = ({id, lnd, signatures}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!id) {
          return cbk([400, 'ExpectedSessionIdToFinishMuSig2Session']);
        }

        if (!isLnd({lnd, method, type})) {
          return cbk([400, 'ExpectedAuthenticatedLndToFinishMuSig2Session']);
        }

        if (isArray(signatures) && !signatures.length) {
          return cbk([400, 'ExpectedPartialSignaturesToCombineToEndSession']);
        }

        return cbk();
      },

      // Close out the signing session
      endSession: ['validate', ({}, cbk) => {
        // Exit early when there are signatures to combine
        if (isArray(signatures)) {
          return cbk();
        }

        return lnd[type].muSig2Cleanup({session_id: hexAsBuffer(id)}, err => {
          if (!!err) {
            return cbk([503, 'UnexpectedErrorCleaningUpMuSig2Session', {err}]);
          }

          return cbk();
        });
      }],

      // Update the session with signatures
      updateSignatures: ['validate', ({}, cbk) => {
        // Exit early when there are no signatures to update
        if (!isArray(signatures)) {
          return cbk(null, {});
        }

        return lnd[type][method]({
          other_partial_signatures: signatures.map(hexAsBuffer),
          session_id: hexAsBuffer(id),
        },
        (err, res) => {
          if (!!err) {
            return cbk([503, 'UnexpectedErrorFinishingMuSig2Session', {err}]);
          }

          if (!res) {
            return cbk([503, 'ExpectedResponseForMuSig2CombineRequest']);
          }

          if (res.have_all_signatures === false) {
            return cbk([400, 'ExpectedAllSignaturesProvidedForSession']);
          }

          if (!isBuffer(res.final_signature)) {
            return cbk([503, 'ExpectedFinalSignatureInCombineResponse']);
          }

          return cbk(null, {signature: bufferAsHex(res.final_signature)});
        });
      }],
    },
    returnResult({reject, resolve, of: 'updateSignatures'}, cbk));
  });
};
