const asyncAuto = require('async/auto');
const {encodeAsync} = require('cbor');
const {returnResult} = require('asyncjs-util');

/** Encode a CBOR response

  {
    data: <Data Object>
    event: <Event String>
  }

  @returns via cbk or Promise
  {
    response: <Response Buffer>
  }
*/
module.exports = ({data, event}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!data) {
          return cbk([400, 'ExpectedDataToEncodeResponse']);
        }

        if (!event) {
          return cbk([400, 'ExpectedEventToEncodeResponse']);
        }

        return cbk();
      },

      // Encode the response to CBOR
      encode: ['validate', ({}, cbk) => {
        (async () => {
          return cbk(null, {response: await encodeAsync({data, event})});
        })();
      }],
    },
    returnResult({reject, resolve, of: 'encode'}, cbk));
  });
};
