export class Success<T, E> {
  readonly isSuccess = true as const;
  readonly isFailure = false as const;

  constructor(readonly value: T) {}

  getValue(): T {
    return this.value;
  }
}

export class Failure<T, E> {
  readonly isSuccess = false as const;
  readonly isFailure = true as const;

  constructor(readonly error: E) {}

  getError(): E {
    return this.error;
  }
}

export type Result<T, E> = Success<T, E> | Failure<T, E>;

export function success<T, E = never>(value: T): Result<T, E> {
  return new Success<T, E>(value);
}

export function failure<E, T = never>(error: E): Result<T, E> {
  return new Failure<T, E>(error);
}
