# Contributing

These are the conventions the code in this repository follows. They are
derived from the existing code, so when in doubt, find a nearby method that
does something similar and match it.

## Running tests

Node 22 or later is required.

    npm test

This runs every test with coverage and then the TypeScript type tests. To run
a single test file with coverage for the file it exercises:

    node --test --experimental-test-coverage \
      --test-coverage-include=lnd_methods/onchain/get_utxos.js \
      test/lnd_methods/onchain/test_get_utxos.js

## Layout

Each method lives in its own `snake_case.js` file under the `lnd_methods/`
directory that matches its area (`onchain`, `offchain`, `invoices`, ...) and
exports a single function. Adding a method means:

- The method file, plus a `.d.ts` typings file beside it with the same name
- An export from the directory's `index.js`, then from `lnd_methods/index.js`,
    then from the root `index.js`, each list kept in alphabetical order
- A test file at the mirrored path under `test/`, named `test_<file>.js`
- An entry in the `## Methods` list in `README.md`
- A line in `CHANGELOG.md` under the next version, in the form
    `` - `methodName`: What changed ``

Shared helpers go in the small utility directories at the root (`arrays/`,
`grpc/`, `lnd_requests/`, `lnd_responses/`, `bolt00/`, `bolt02/`), one
function per file, exported by name from that directory's `index.js`.

## Formatting

- Lines are at most 79 characters
- Two space indentation, single quotes, semicolons everywhere
- Every function body ends with an explicit `return`, including `return;` and
    `return cbk();`, and arrow function bodies that do work use `return` too
- A blank line goes before a `return` that follows other statements, and
    after every `if` block
- Boolean coercion is written `!!value`, and a zero default is `Number()`
- Builtins are destructured into constants rather than referenced inline:
    `const {isArray} = Array;`

## Imports and constants

Imports come first, in two groups separated by a blank line: packages, then
local files. Within a group, lines are sorted by the variable name,
case-insensitively, so `asyncAuto` precedes `asyncify` which precedes
`asyncRetry`. Each destructured import gets its own `require`, even when
several come from the same module:

    const {chanFormat} = require('bolt07');
    const {chanNumber} = require('bolt07');

Constants and one-line helper functions follow the imports, also sorted by
name. Magic strings and numbers are named here, never inlined below.

## Variables and objects

Use `const`. Do not introduce `let`: when a value has to be computed inside a
`try` and used after it, restructure instead, either with an asyncified step
(see below) or a helper function that returns the value.

In object literals, shorthand properties come first, then keyed properties in
alphabetical order:

    const row = {
      transaction,
      confirmation_count: initialConfirmationCount,
      id: idForTransaction({transaction}).id,
      is_confirmed: false,
    };

Do not chain a property access onto the closing line of a multi-line call.
Destructure the result into a constant first, then use it:

    const {ids} = outgoingChannelIds({
      outgoing_channel: args.outgoing_channel,
      outgoing_channels: args.outgoing_channels,
    });

    return ids;

Optional result fields that are absent are set to `undefined` with
`value || undefined` rather than left out conditionally. Public argument and
result keys are `snake_case`; local variables and step names are `camelCase`.

## Documentation and comments

Every exported function has a `/** */` comment that gives a one-line title,
any permission or LND version requirements, the shape of its arguments with
optional keys in brackets, `@throws` where it throws, and the result shape
under `@returns` (or `@returns via cbk or Promise` for methods):

    /** Get pending self-transfer spends

      Requires `onchain:read` permission

      {
        lnd: <Authenticated LND API Object>
      }

      @returns via cbk or Promise
      {
        sweeps: [{
          tokens: <Sweep Outpoint Tokens Value Number>
        }]
      }
    */

The block comment is for the interface: it does not explain how the function
behaves. Explanations go inline in the code as `//` comments next to the
lines they explain, unless a note is necessary to use the function or gives
context about a specific argument or result attribute.

Inline comments are sentence case with no trailing period. Every `asyncAuto`
step has a one-line comment above it saying what it does. A conditional
early return is introduced with `// Exit early when ...`.

## Errors

Methods report errors as an array: `[code, 'MessageInCamelCase', {details}]`.
The third element is optional and carries context such as `{err}`. Codes
follow HTTP: `400` for a bad argument, `403` for a permission problem, `404`
for something that does not exist, `429` for a condition to retry, `500` for
an internal failure, `501` for something the connected LND does not support,
and `503` for an LND error or an unexpected response.

Synchronous helpers throw `new Error('MessageInCamelCase')`. The method that
calls one catches it and translates it into the array form, choosing the
code.

## Methods

A method takes `(args, cbk)` and returns a Promise when no callback is given,
with the body an `asyncAuto` flow passed to `returnResult`:

    module.exports = ({lnd}, cbk) => {
      return new Promise((resolve, reject) => {
        return asyncAuto({
          // Check arguments
          validate: cbk => {
            if (!isLnd({lnd, method, type})) {
              return cbk([400, 'ExpectedLndToGetPendingSweeps']);
            }

            return cbk();
          },

          // Get the pending sweeps
          getSweeps: ['validate', ({}, cbk) => {
            return lnd[type][method]({}, (err, res) => {
              if (!!err) {
                return cbk([503, 'UnexpectedGetPendingSweepsError', {err}]);
              }

              if (!res || !isArray(res.pending_sweeps)) {
                return cbk([503, 'ExpectedArrayOfPendingSweepsInResponse']);
              }

              return cbk(null, res.pending_sweeps);
            });
          }],

          // Map the pending sweeps into the final format
          sweeps: ['getSweeps', asyncify(({getSweeps}) => {
            try {
              return {sweeps: getSweeps.map(rpcSweepAsSweep)};
            } catch (err) {
              throw [503, err.message];
            }
          })],
        },
        returnResult({reject, resolve, of: 'sweeps'}, cbk));
      });
    };

The conventions in that shape:

- `validate` is always the first step and every other step depends on it
- Steps are named for what they produce, and a step that calls LND does only
    that: it checks `err` and the shape of the response and passes the
    response through. Parsing the response into the result is its own step.
- Steps are callback style by default: they take `cbk` and call it with an
    error array or a result. A step that only checks arguments stays
    callback style even though it does no asynchronous work.
- `asyncify` from `async/asyncify` is used only when it is necessary, which
    is when a step has to catch a synchronous throw: a `try` inside a step
    is the signal. An asyncified step takes no callback: it returns its
    result and throws its error array. Steps without dependencies are
    `asyncify(() => ...)`, steps with dependencies are
    `asyncify(({dep}) => ...)`. If a change removes the last `try` from an
    asyncified step, convert the step back to callback style.
- An asyncified step must stay a plain synchronous function. Never mark it
    `async` or return a Promise from it: `asyncify` would then convert a
    thrown error array into an `Error` whose message is the array joined.
- Inside an asyncified step, argument checks that throw go before the `try`,
    not inside it, so that a thrown array is not caught and rethrown as
    `[503, undefined]`. The `catch` rethrows as an array, usually
    `throw [503, err.message]`.
- Never call `cbk` inside a `try` block. `asyncAuto` runs dependent steps
    synchronously inside that call, so an exception thrown by a later step
    would be caught here and reported as a second callback.
- The final callback is `returnResult({reject, resolve, of: 'stepName'})`,
    with `of` naming the step whose result is the method's result.

## Subscriptions

A `subscribeTo*` method validates its arguments synchronously, throwing an
`Error`, and returns an `EventEmitter`. The gRPC stream is wrapped so that:

- Stream errors and unreadable data from LND go through one stream-level
    error function, either `emitSubscriptionError` from `grpc/` or a local
    equivalent, which decides whether the subscription is cancelled
- Events are emitted with `emitSubscriptionEvent` from `grpc/`, never with
    `emitter.emit` directly inside a `try`. A listener that throws is the
    consumer's defect, not the stream's: the helper reports it as an `error`
    event and leaves the stream running.
- The data handler keeps its parsing inside a `try` and calls the helper
    from inside it, so a parse failure reaches the stream-level error
    function and a listener failure does not:

      subscription.on('data', tx => {
        try {
          return emitSubscriptionEvent({
            data: rpcTxAsTransaction(tx),
            emitter: eventEmitter,
            event: 'chain_transaction',
          });
        } catch (err) {
          return emitErr([503, err.message]);
        }
      });

- When a listener failure must trigger an action, such as failing back a
    held HTLC in `subscribeToForwardRequests`, the emit deliberately stays
    inside the `try` with a comment saying why
- The subscription is cancelled when its last listener is removed, with
    `handleRemoveListener` from `grpc/` or a `removeListener` handler

## Tests

Every source file has a test file at the mirrored path under `test/`. Tests
use `node:test` and `node:assert/strict` and are table driven: a `tests`
array of cases with `args`, a sentence-case `description`, and either
`error` (the exact error array or message) or `expected` (the exact result),
followed by one `tests.forEach` that runs them. Harness fields beyond those
are collected with `...scenario`. Argument and LND mocks are built by
`makeArgs` and `makeLnd` helpers that take overrides.

The runner is a single path. Its only branch is an early `return` after
asserting an error case, and its mechanics live in a macro, not in the
runner. Everything a case needs beyond `args`, `error` and `expected` is
declared on the case as data: a list of events to listen for (`listening`,
defaulting to all of them), a list of events whose listener throws
(`throwing`), a script of `[event, data]` pairs to replay into the mock
stream (`stream`), a list of events whose listeners are removed afterwards
(`removing`). The runner spreads the case into the macro and makes one
`deepStrictEqual` of what came back against `expected` with defaults
filled in, so nothing is counted with `.length` and nothing is guarded by
`if`. Subscriptions use `subscriptionEvents` from `test/lnd_methods/macros`;
`test_subscribe_to_transactions.js` is the reference.

A change to a file should leave it fully covered: every error message has a
case that produces it, every result shape has a case that asserts it, and a
subscription has a case where a listener throws and the stream continues.
Check with the coverage command above; aim for 100% of lines and branches
in each changed file.
