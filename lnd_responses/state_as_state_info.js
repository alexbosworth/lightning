const {keys} = Object;

/** Interpret state as wallet status

  {
    state: <State String>
  }
*/
module.exports = args => {
  if (!args) {
    throw new Error('ExpectedStateResponse');
  }

  if (!args.state) {
    throw new Error('ExpectedStateInStateResponse');
  }

  return {
    "state": args.state,
  };
};
