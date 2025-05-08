export class JWTInvalidError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "JWTInvalidError";

        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this);
    }
}

export class InvalidCredentialsError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InvalidCredentialsError"

        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this);
    }
}

export class DuplicateEmailError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "DuplicateEmailError";

        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this);
    }
}

export class NotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "NotFoundError";

        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this);
    }
}