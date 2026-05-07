class HttpError extends Error {
    constructor(message = "Internal Server Error",status=500){
        super(message);
        this.status = status;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = HttpError;