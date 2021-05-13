export type Result<T, E> = ok<T> | err<E>;
export type ok<T> = {
  _tag: "ok";
  value: T;
};
export type err<E> = {
  _tag: "err";
  error: E;
};

export const ok = <T>(value: T): ok<T> => {
  return {
    _tag: "ok",
    value,
  };
};
export const err = <E>(error: E): err<E> => {
  return {
    _tag: "err",
    error,
  };
};

export const Result = {
  ok,
  err,
};
