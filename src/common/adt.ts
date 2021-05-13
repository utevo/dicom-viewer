export type Result<T, E> = Ok<T> | Err<E>;
interface Ok<T> {
  _tag: "Ok";
  value: T;
}
interface Err<E> {
  _tag: "Err";
  error: E;
}

const Ok = <T>(value: T): Ok<T> => {
  return {
    _tag: "Ok",
    value,
  };
};
const Err = <E>(error: E): Err<E> => {
  return {
    _tag: "Err",
    error: error,
  };
};

export const Result = {
  Ok,
  Err,
};
