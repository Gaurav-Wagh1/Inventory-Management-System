async function validateUpdateStatus(req, res, next) {
    const token = req.cookies.accessToken || req.body.accessToken;
    if (!token) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(
                new ResponseError(
                    "Un-authorized user",
                    "You are not authorized to perform this action!"
                )
            );
    }

    if (!req.body.userId || !req.body.status) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(
                new ResponseError(
                    "Invalid Credentials",
                    "Provide valid credentials to update the role!"
                )
            );
    }

    let response;
    try {
        response = jwt.verify(token, ACCESS_TOKEN_SECRET_STRING);
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res
                .status(StatusCodes.UNAUTHORIZED)
                .json(
                    new ResponseError("Token expired", "Please log in again.")
                );
        }
    }

    if (response.role !== "staff") {
        return res
            .status(StatusCodes.UNAUTHORIZED)
            .json(
                new ResponseError(
                    "Un-authorized user",
                    "You are not authorized to perform this action!"
                )
            );
    }
    // req.user = { userId: response.userId, role: response.role };

    next();
}

module.exports = { validateUpdateStatus };
