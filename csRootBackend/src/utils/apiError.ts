class apiError extends Error {
  statusCode: number;
  success: boolean;
  errors: unknown[];
  message: string;

  constructor(
    statusCode: number,
    message: string = "Something went wrong",
    errors: unknown[] = []
  ) {
    super(message);

    this.name = "apiError";
    this.statusCode = statusCode;
    this.success = false;
    this.message = message;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default apiError;