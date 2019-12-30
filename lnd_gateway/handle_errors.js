const {isArray} = Array;
const serverErrorCode = 500;

/** Handle errors

  {
    err: <Error Object>
    next: <Next Express Middleware Function>
    res: {
      headersSent: <Headers Already Sent Bool>
      send: <Send Response Function>
      status: <Set Status Function>
    }
  }

  @returns
  {
    middleware: <Express Middleware Function>
  }
*/
module.exports = ({}) => {
  const middleware = (err, req, res, next) => {
    if (res.headersSent) {
      return next(err)
    }

    if (isArray(err)) {
      const [statusCode] = err;

      return res.status(statusCode || serverErrorCode) && res.send();
    }

    return res.status(serverErrorCode) && res.send();
  };

  return {middleware};
};
