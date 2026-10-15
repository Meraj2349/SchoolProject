// Errors the domain and application layers throw. `code` is an i18n key
// (see config/i18n.js) so the HTTP layer can translate it for the client.
export class DomainError extends Error {
  constructor(code, message = code) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
  }
}

export class ValidationError extends DomainError {}

export class NotFoundError extends DomainError {}
