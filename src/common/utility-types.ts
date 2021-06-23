export type ExtractStrict<T, U extends T> = Extract<T, U>;

export type ValueOf<T> = T[keyof T];
