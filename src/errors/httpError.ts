export interface HttpError extends Error {
  httpStatus: number;
}

export class BadRequestError extends Error implements HttpError {
  httpStatus = 400;
  constructor(message = "Bad Request") {
    super(message);
    this.name = "BadRequestError";
  }
}

export class NotFoundError extends Error implements HttpError {
  httpStatus = 404;
  constructor(message = "Not Found") {
    super(message);
    this.name = "NotFoundError";
  }
}
