const authHeaderName = 'authorization';
const bearerTokenRegex = /Bearer\s(\S+)/;

/** Parse out bearer token

  {}

  @returns
  {
    middleware: <Parse Bearer Token Express Middleware Function>
  }
*/
module.exports = ({}) => {
  const middleware = (req, res, next) => {
    const authHeaderValue = req.get(authHeaderName);

    // Exit early when there is no bearer token
    if (!authHeaderValue) {
      return next();
    }

    const [, bearer] = authHeaderValue.match(bearerTokenRegex);

    res.locals.auth = {bearer};

    return next();
  };

  return {middleware};
};
