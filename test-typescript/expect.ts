/** True when A and B are exactly the same type, not just assignable */
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2)
    ? true
    : false;

/** Assert that a value's type is exactly the expected type

  Usage: expectType<Expected>()(value)

  A type mismatch fails with an error showing the expected and actual types
*/
export const expectType =
  <Expected>() =>
  <Actual>(
    value: Actual &
      (Equal<Actual, Expected> extends true
        ? unknown
        : {typeMismatch: {expected: Expected; actual: Actual}})
  ): void => {};
