export class Success<T> {
  readonly isSuccess = true as const;
  readonly isFailure = false as const;

  constructor(readonly value: T) {}

  getValue(): T {
    return this.value;
  }
}

export class Failure<E> {
  readonly isSuccess = false as const;
  readonly isFailure = true as const;

  constructor(readonly error: E) {}

  getError(): E {
    return this.error;
  }
}

export type Result<T, E> = Success<T> | Failure<E>;

export function success<T, E = never>(value: T): Result<T, E> {
  return new Success<T>(value);
}

export function failure<E, T = never>(error: E): Result<T, E> {
  return new Failure<E>(error);
}
