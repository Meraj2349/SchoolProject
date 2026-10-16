// Errors the domain and application layers throw. `code` is an i18n key
// (see config/i18n.js) so the HTTP layer can translate it for the client.
export class DomainError extends Error {
  // `details` is safe extra data for the client (e.g. counts), sent as `data`.
  constructor(code, message = code, { details } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    if (details !== undefined) this.details = details;
  }
}

export class ValidationError extends DomainError {}

export class NotFoundError extends DomainError {}

// The request is valid but clashes with the current state (e.g. a duplicate,
// or removing the last super admin).
export class ConflictError extends DomainError {}

// The admin may see the row but not change it (e.g. a branch admin and a
// whole-school notice).
export class ForbiddenError extends DomainError {}

// The caller is not signed in, or their sign-in was refused (e.g. a wrong
// password in the teacher app).
export class UnauthorizedError extends DomainError {}

// Too many attempts: try again later (e.g. a mobile number locked after
// repeated wrong passwords).
export class TooManyRequestsError extends DomainError {}
