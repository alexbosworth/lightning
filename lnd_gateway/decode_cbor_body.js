const {decodeFirst} = require('cbor');

const badArgumentsCode = 400;

/** Create express middleware to decode a CBOR body

  {}

  @returns
  {
    middleware: <Middleware Function>
  }
*/
module.exports = ({}) => {
  const middleware = (req, res, next) => {
    decodeFirst(req.body, (err, decoded) => {
      if (!!err) {
        return next([badArgumentsCode, 'ExpectedCborRequestArgs']);
      }

      req.body = decoded;

      return next();
    });

    return;
  };

  return {middleware};
};
