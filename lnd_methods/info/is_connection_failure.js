const grpc = require('@grpc/grpc-js');

const {connectionFailureMessages} = require('./constants');

const errorText = err => [err.details, err.message].filter(isString).join(' ');
const isString = n => typeof n === 'string';
const unavailableCode = grpc.status.UNAVAILABLE;

/** Determine if an error represents a failure to connect to the daemon

  {
    [err]: {
      [code]: <gRPC Status Code Number>
      [details]: <gRPC Status Details String>
      [message]: <Error Message String>
    }
  }

  @returns
  <Is Connection Failure Bool>
*/
module.exports = ({err}) => {
  // Exit early when there is no error
  if (!err) {
    return false;
  }

  // Exit early when the connection is reported as unavailable
  if (err.code === unavailableCode) {
    return true;
  }

  const normalized = errorText(err).toLowerCase();

  return !!connectionFailureMessages.find(n => normalized.includes(n));
};
