const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const feedback = {replace_response: false};

/** Accept an RPC request

  {
    id: <Request or Response Id Number To Accept>
    subscription: <RPC Request Stream Object>
  }

  @returns via cbk or Promise
*/
module.exports = ({id, subscription}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!id) {
          return cbk([400, 'ExpectedRequestIdToAcceptRpcRequest']);
        }

        if (!subscription) {
          return cbk([400, 'ExpectedRpcSubscriptionToAcceptRpcRequest']);
        }

        return cbk();
      },

      // Send accept feedback to the stream
      accept: ['validate', ({}, cbk) => {
        return subscription.write({feedback, ref_msg_id: id}, err => {
          if (!!err) {
            return cbk([503, 'UnexpectedErrorAcceptingRpcRequest', {err}]);
          }

          return cbk();
        });
      }],
    },
    returnResult({reject, resolve}, cbk));
  });
};
