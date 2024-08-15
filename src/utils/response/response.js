class ResponseSuccess {
    constructor(data, message) {
        this.data = data;
        this.success = true;
        this.error = {};
        this.message = message;
    }
}

class ResponseError {
    constructor(error, message) {
        this.data = {};
        this.success = false;
        this.error = error;
        this.message = message;
    }
}

module.exports = {
    ResponseSuccess,
    ResponseError,
};
