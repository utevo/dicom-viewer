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
