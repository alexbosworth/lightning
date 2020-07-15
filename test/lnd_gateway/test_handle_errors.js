const {test} = require('@alexbosworth/tap');

const handleErrors = require('./../../lnd_gateway/handle_errors');

const tests = [
  {
    args: {res: {headersSent: true}},
    description: 'Headers already sent disables error handling',
  },
  {
    args: {err: [501]},
    description: 'Error code is returned',
  },
  {
    args: {err: []},
    description: 'Default error code is returned',
  },
  {
    args: {err: new Error('err')},
    description: 'Default error code is returned when the error is unknown',
  },
];

tests.forEach(({args, description, expected}) => {
  return test(description, ({equal, end}) => {
    const {middleware} = handleErrors({});

    const next = !!args.res && !!args.res.headersSent ? () => end() : null;

    const res = {headersSent: args.res && !!args.res.headersSent};

    if (!!args.err) {
      const [expectedCode] = Array.isArray(args.err) ? args.err : [500];
      let code;

      res.status = n => code = n;

      res.send = () => {
        equal(code, expectedCode || 500, 'Got expected code');

        return end();
      };
    }

    return middleware(args.err, {}, res, next);
  });
});
