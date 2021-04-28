export type Result<T, E> = Ok<T> | Err<E>;
export enum ResultTag {
  Ok,
  Err,
}
interface Ok<T> {
  _tag: ResultTag.Ok;
  value: T;
}
interface Err<E> {
  _tag: ResultTag.Err;
  value: E;
}

const Ok = <T>(value: T): Ok<T> => {
  return {
    _tag: ResultTag.Ok,
    value,
  };
};
const Err = <E>(value: E): Err<E> => {
  return {
    _tag: ResultTag.Err,
    value,
  };
};

export const Result = {
  Ok,
  Err,
};
