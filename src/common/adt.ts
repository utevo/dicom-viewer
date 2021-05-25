export type Result<T, E> = Ok<T> | Err<E>;
export type Ok<T> = {
  _tag: "Ok";
  value: T;
};
export type Err<E> = {
  _tag: "Err";
  error: E;
};

export const Ok = <T>(value: T): Ok<T> => {
  return {
    _tag: "Ok",
    value,
  };
};
export const Err = <E>(error: E): Err<E> => {
  return {
    _tag: "Err",
    error,
  };
};

export const Result = {
  Ok,
  Err,
};
