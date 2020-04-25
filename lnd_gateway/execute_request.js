const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

/** Execute an LND request and get the CBOR encoded result

  {
    lnd: <gRPC LND Object>
    method: <Method Name String>
    params: <gRPC API Arguments Object>
    service: <Service Name String>
  }

  @returns via cbk or Promise
  {
    [err]: {
      details: <Error Details String>
      message: <Error Message String>
    }
    [res]: <Response Object>
  }
*/
module.exports = ({lnd, method, params, service}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!lnd) {
          return cbk([400, 'ExpectedLndToExecuteGatewayRequest']);
        }

        if (!method) {
          return cbk([400, 'ExpectedMethodToExecuteGatewayRequest']);
        }

        if (!params) {
          return cbk([400, 'ExpectedArgumentsToExecuteGatewayRequest']);
        }

        if (!service) {
          return cbk([400, 'ExpectedServiceToExecuteGatewayRequest']);
        }

        return cbk();
      },

      // Execute request
      execute: ['validate', ({}, cbk) => {
        try {
          return lnd[service][method](params, (err, res) => {
            if (!!err) {
              return cbk(null, {err});
            }

            return cbk(null, {res});
          });
        } catch (err) {
          return cbk(null, {err});
        }
      }],

      // Result of execution
      result: ['execute', ({execute}, cbk) => {
        if (!!execute.err) {
          return cbk(null, {
            err: {details: execute.err.details, message: execute.err.details},
          });
        }

        return cbk(null, {res: execute.res});
      }],
    },
    returnResult({reject, resolve, of: 'result'}, cbk));
  });
};
