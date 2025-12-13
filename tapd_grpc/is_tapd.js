/** Determine if object is a tapd gRPC API object

  {
    [tapd]: <tapd Object>
    [method]: <Method Name String>
    [type]: <Method Type String>
  }

  @returns
  <Is Tapd Bool>
*/
module.exports = ({tapd, method, type}) => {
  return !!tapd && !!tapd[type] && !!tapd[type][method];
};
