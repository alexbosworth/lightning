type Without<T, U> = {
  [KeyType in Exclude<keyof T, keyof U>]?: never;
};

export type Xor<T, U> = T | U extends object
  ? (Without<T, U> & U) | (Without<U, T> & T)
  : T | U;
