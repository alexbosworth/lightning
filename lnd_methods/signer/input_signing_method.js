const v0SpendMethod = 0;
const v1Bip86Method = 1;
const v1SpendMethod = 2;
const v1ScriptSpend = 3;

/** Determine a signing method for an input

  {
    input: [{
      [root_hash]: <Taproot Root Hash Hex String>
      [witness_script]: <Witness Script Hex String>
    }]
    [outputs]: [{
      pk_script: <UTXO Output Script Buffer Object>
      value: <UTXO Tokens Number>
    }]
  }

  @returns
  {
    method: <Signing Method Number>
  }
*/
module.exports = ({input, outputs}, cbk) => {
  // Exit early when lack of previous outputs indicates a v0 spend
  if (!outputs) {
    return {method: v0SpendMethod};
  }

  // Exit early when no leaf script or script commitment is present
  if (!input.root_hash && !input.witness_script) {
    return {method: v1Bip86Method};
  }

  // Exit early when there is no leaf script, just a top level key spend
  if (!input.witness_script) {
    return {method: v1SpendMethod};
  }

  // Sign for a leaf script for a key that commits to the scripts root hash
  return {method: v1ScriptSpend};
};
