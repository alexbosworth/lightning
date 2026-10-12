const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const blindedPathPastSelf = require('./blinded_path_past_self');

/** Step the probe target of a blinded path that starts at the node past it

  The target of a path that starts at the node becomes the next node of the
  path, sent what the node would forward into the rest of the path. Other
  targets stay as they are.

  There is no target when the path cannot be stepped past the node, or when
  the fees of the node are beyond the fees of the path.

  Requires `info:read`, `offchain:read`, `signer:generate` permissions when the
  path starts at the node

  {
    id: <Node Identity Public Key Hex String>
    lnd: <Authenticated LND API Object>
    mtokens: <Millitokens To Deliver String>
    target: {
      cltv_delta: <Destination Final CLTV Delta Number>
      destination: <Destination Public Key Hex String>
      mtokens: <Millitokens To Send To Destination String>
      [path]: <Blinded Path Object>
    }
  }

  @returns via cbk or Promise
  {
    [target]: {
      cltv_delta: <Destination Final CLTV Delta Number>
      destination: <Destination Public Key Hex String>
      mtokens: <Millitokens To Send To Destination String>
      [path]: <Blinded Path Object>
    }
  }
*/
module.exports = ({id, lnd, mtokens, target}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Step past the node when the path starts at the node
      step: cbk => {
        // Exit early when the target is not a path that starts at the node
        if (!target.path || target.destination !== id) {
          return cbk();
        }

        return blindedPathPastSelf({
          id,
          lnd,
          mtokens: target.mtokens,
          path: target.path,
        },
        cbk);
      },

      // The target past the node is the next node of the path
      stepped: ['step', ({step}, cbk) => {
        // Exit early when the target does not start at the node
        if (!step) {
          return cbk(null, {target});
        }

        // Exit early when the path cannot be stepped past the node
        if (!step.path) {
          return cbk(null, {});
        }

        // Exit early when the fees of the node are beyond the path fees
        if (BigInt(step.mtokens) < BigInt(mtokens)) {
          return cbk(null, {});
        }

        return cbk(null, {
          target: {
            cltv_delta: step.path.cltv_delta,
            destination: step.path.introduction_node,
            mtokens: step.mtokens,
            path: step.path,
          },
        });
      }],
    },
    returnResult({reject, resolve, of: 'stepped'}, cbk));
  });
};
