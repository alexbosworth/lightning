const {status} = require('@grpc/grpc-js');

const accessDeniedCodes = [status.PERMISSION_DENIED, status.UNAUTHENTICATED];
const rejectionCodes = [status.INVALID_ARGUMENT, status.UNIMPLEMENTED];

// LND denies access with these messages: a missing, unreadable, expired,
// locked, or insufficiently permissioned macaroon
const accessDeniedMessages = [
  /^cannot determine data format of binary-encoded macaroon/,
  /^empty macaroon data/,
  /^expected 1 macaroon/,
  /^invalid ID$/,
  /^permission denied$/,
  /^unknown macaroon version/,
  /^unmarshal v[12]/,
  /^verification failed/,
];

/** Derive the error for an invoices subscription that LND rejected

  A rejected subscription is not recovered by subscribing again

  {
    [err]: {
      [code]: <gRPC Status Code Number>
      [details]: <gRPC Status Details String>
    }
  }

  @returns
  {
    [error]: <Subscription Rejected Error Array>
  }
*/
module.exports = ({err}) => {
  // Exit early when there is no error to derive a rejection from
  if (!err) {
    return {};
  }

  const isDeniedCode = accessDeniedCodes.includes(err.code);
  const isDeniedMessage = accessDeniedMessages.some(n => n.test(err.details));

  if (isDeniedCode || isDeniedMessage) {
    return {error: [403, 'PermissionDeniedToSubscribeToInvoices', {err}]};
  }

  if (rejectionCodes.includes(err.code)) {
    return {error: [503, 'SubscriptionToInvoicesRejected', {err}]};
  }

  return {};
};
