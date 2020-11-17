const {decodeChanId} = require('bolt07');

const relativeThawHeightMarker = 5e5;

/** Decode a thaw height number

  {
    id: <Numeric Channel Id String>
    thaw: <Thaw Height Number>
  }

  @returns
  {
    [height]: <Prevent Coop Close Until Height Number>
  }
*/
module.exports = ({id, thaw}) => {
  // Exit early when there is no cooperative close constraint
  if (!thaw) {
    return {height: undefined};
  }

  // Exit early when a fixed height is specified by being more than threshold
  if (thaw >= relativeThawHeightMarker) {
    return {height: thaw};
  }

  const funding = decodeChanId({number: id});

  // The cooperative close constraint is relative to the funding conf height
  return {height: funding.block_height + thaw};
};
