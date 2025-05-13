// Mendefinisikan error khusus untuk token JWT yang tidak valid
export class JWTInvalidError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "JWTInvalidError";

        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this);
    }
}

// Mendefinisikan error untuk kredensial yang tidak valid saat login
export class InvalidCredentialsError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InvalidCredentialsError"

        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this);
    }
}

// Mendefinisikan error khusus untuk data duplikat (misal: duplicate key)
export class DuplicateError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "DuplicateError";

        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this);
    }
}

// Mendefinisikan error untuk data yang tidak ditemukan
export class NotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "NotFoundError";

        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this);
    }
}

// Mendefinisikan error untuk stok medicine yang habis
export class InsufficientStockError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InsufficientStockError";

        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this);
    }
}

// Mendefinisikan error untuk otorisasi yang tidak terpenuhi
export class InsufficientAuthorizationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InsufficientAuthorizationError";

        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this);
    }
}