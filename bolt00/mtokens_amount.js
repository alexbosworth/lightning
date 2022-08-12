const isNumber = n => !isNaN(n);
const tokensAsMtokens = tokens => (BigInt(tokens) * BigInt(1e3)).toString();

/** Derive millitokens from tokens and mtokens

  {
    [mtokens]: <Millitokens String>
    [tokens]: <Tokens Number>
  }

  @throws <Error>

  @returns
  {
    [mtokens]: <Millitokens String>
  }
*/
module.exports = ({mtokens, tokens}) => {
  // Exit early when no tokens are specified
  if (!mtokens && tokens === undefined) {
    return {};
  }

  if (!mtokens && !isNumber(tokens)) {
    throw new Error('ExpectedEitherTokensNumberOrMtokensStringForAmountValue');
  }

  // Exit early when there is only tokens set
  if (!mtokens) {
    return {mtokens: tokensAsMtokens(tokens)};
  }

  // Exit early when there is only mtokens set
  if (tokens === undefined) {
    return {mtokens};
  }

  // Exit early when the mtokens and tokens don't agree
  if (mtokens !== tokensAsMtokens(tokens)) {
    throw new Error('ExpectedEqualValuesForTokensAndMtokens');
  }

  return {mtokens};
};
