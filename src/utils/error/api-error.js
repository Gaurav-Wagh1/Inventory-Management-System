class ApiError extends Error {
    constructor(error = "Internal error", message, statusCode = 500) {
        super(message);
        this.name = this.constructor.name;
        this.error = error;
        this.statusCode = statusCode;
    }
}

module.exports = { ApiError };
