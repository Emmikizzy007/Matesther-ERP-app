/** Base class for errors that are safe to surface to an end user. */
export class AppError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status: number,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends AppError {
  constructor(
    message = "The submitted data is invalid.",
    readonly fieldErrors: Record<string, string[]> = {},
  ) {
    super(message, "VALIDATION_ERROR", 422);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "You must sign in to continue.") {
    super(message, "UNAUTHENTICATED", 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "You do not have permission to perform this action.") {
    super(message, "FORBIDDEN", 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "The requested record does not exist.") {
    super(message, "NOT_FOUND", 404);
  }
}

/** Narrows an unknown thrown value to a user-presentable message. */
export function toUserMessage(error: unknown): string {
  if (error instanceof AppError) return error.message;
  return "Something went wrong. Please try again.";
}
