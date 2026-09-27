# Backend Development Guidelines - NestJS

## 1. Hexagonal Architecture (Ports and Adapters)
- Divide the project into three well-defined layers:
  - `src/domain/`: Pure domain entities and business rules. Code written entirely in TypeScript, with NO dependencies on NestJS, ORMs, or external libraries.
  - `src/application/`: Use cases and input/output port interfaces.
  - `src/infrastructure/`: NestJS controllers, database adapters (PostgreSQL), HTTP client adapters (Wompi API), and DTOs with class-validator.
- The domain and application layers must NEVER import modules from `@nestjs/*` or ORM decorators.

## 2. Railway-Oriented Programming (ROP)
- Do not use `throw new Error()` or exceptions for known business flow errors (e.g., insufficient stock, card declined).
- Implement and use the `Result<T, E>` (or `Either<L, R>`) pattern to explicitly return success (`Success`) or failure (`Failure`).
- Use cases must chain operations by evaluating the result of each step before continuing.

## 3. Quality and Testing
- Write unit tests with Jest for each use case and adapter.
- Test coverage must exceed 80%.
- Follow the SOLID principles, use TypeScript in strict mode (using `any` is prohibited), and include explicit return types in all functions.

Translated with DeepL.com (free version)

