const { StatusCodes } = require("http-status-codes");
const {
    signupUser,
    signInUser,
    logoutUser,
    updateRole,
    getDetails,
    enableTwoFA,
    verifyTwoFA,
    disableTwoFA,
    updateDetails,
    getSelfDetails,
    refreshAccessToken,
} = require("../../src/controllers/user-controller.js");
const { UserService } = require("../../src/services/user-service.js");
const { ApiError } = require("../../src/utils/error/api-error.js");
const {
    ResponseError,
    ResponseSuccess,
} = require("../../src/utils/response/response.js");

describe("signup user", () => {
    let requestObject, responseObject, spyUserServiceSignup;
    beforeAll(() => {
        requestObject = {
            body: {
                email: "dummy@email.com",
                password: "dummy password",
            },
            admin: false,
        };

        responseObject = {
            status: jest.fn((statusCode) => { }).mockReturnThis(), // will return the object itself
            cookie: jest.fn((tokenName, token, opts) => { }).mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
    });

    beforeEach(() => {
        spyUserServiceSignup = jest.spyOn(UserService.prototype, "signup");
    });

    afterEach(() => {
        spyUserServiceSignup.mockRestore(); // restore the original functionality of mocked method;
        jest.clearAllMocks();
    });

    test("successful signup", async () => {
        // mocked response of service layer method;
        const mockResponse = {
            accessToken: "access token",
            refreshToken: "refresh token",
            userData: requestObject.body,
        };

        spyUserServiceSignup.mockResolvedValue(mockResponse); // mocking user service layer method;

        await expect(
            signupUser(requestObject, responseObject)
        ).resolves.toEqual(responseObject);
        expect(spyUserServiceSignup).toHaveBeenCalledWith({
            ...requestObject.body,
            admin: requestObject.admin,
        });
        await expect(
            spyUserServiceSignup.mock.results[0].value
        ).resolves.toEqual(mockResponse);
        expect(responseObject.status).toBeCalled();
        expect(responseObject.cookie).toBeCalled();
        expect(responseObject.cookie.mock.calls.length).toBe(2);
        expect(responseObject.json).toBeCalled();
        expect.assertions(7);
    });

    test("throw error if user already exist", async () => {
        spyUserServiceSignup.mockRejectedValue(
            new ApiError(
                "User already exist",
                "User with this email already exists!",
                StatusCodes.BAD_REQUEST
            )
        );

        await expect(
            signupUser(requestObject, responseObject)
        ).resolves.toEqual(responseObject);
        expect(spyUserServiceSignup).toBeCalled();
        expect(spyUserServiceSignup).toHaveBeenCalledWith({
            ...requestObject.body,
            admin: requestObject.admin,
        });
        expect(spyUserServiceSignup.mock.results[0].value).rejects.toEqual(
            new ApiError(
                "User already exist",
                "User with this email already exists!",
                StatusCodes.BAD_REQUEST
            )
        );
        expect(responseObject.status).toHaveBeenCalledWith(
            StatusCodes.BAD_REQUEST
        );
        expect(responseObject.json).toHaveBeenCalledWith(
            new ResponseError(
                "User already exist",
                "User with this email already exists!"
            )
        );
        expect.assertions(6);
    });
});

describe("signin user", () => {
    let requestObject, responseObject, spyUserServiceSignin;

    beforeAll(() => {
        requestObject = {
            body: {
                email: "dummy@email.com",
                password: "dummy password",
            },
        };

        responseObject = {
            status: jest.fn((statusCode) => { }).mockReturnThis(), // will return the object itself
            cookie: jest.fn((tokenName, token, opts) => { }).mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
    });

    beforeEach(() => {
        spyUserServiceSignin = jest.spyOn(UserService.prototype, "signIn");
    });

    afterEach(() => {
        spyUserServiceSignin.mockRestore();
        jest.clearAllMocks();
    });

    test("successful sign in without 2 factor authentication", async () => {
        const mockSigninResponse = {
            accessToken: "access token",
            refreshToken: "refresh token",
            is2FAEnabled: undefined,
        };
        spyUserServiceSignin.mockResolvedValue(mockSigninResponse);

        await expect(
            signInUser({ ...requestObject, path: "/signin" }, responseObject)
        ).resolves.toEqual(responseObject);
        expect(spyUserServiceSignin).toBeCalled();
        expect(spyUserServiceSignin).toHaveBeenCalledWith(requestObject.body);
        expect(spyUserServiceSignin.mock.results[0].value).resolves.toEqual(
            mockSigninResponse
        );
        expect(responseObject.status).toHaveBeenCalledWith(StatusCodes.OK);
        expect(responseObject.cookie).toHaveBeenCalledWith(
            "accessToken",
            mockSigninResponse.accessToken,
            expect.any(Object)
        );
        expect(responseObject.cookie).toHaveBeenCalledWith(
            "refreshToken",
            mockSigninResponse.refreshToken,
            expect.any(Object)
        );
        expect(responseObject.cookie.mock.calls.length).toBe(2);
        expect(responseObject.json).toHaveBeenCalledWith(
            new ResponseSuccess({}, "User sign in successful")
        );

        expect.assertions(9);
    });

    test("get a session 2fa token instead of access token if 2 factor authentication is turned on", async () => {
        const mockSigninResponse = {
            session2FAToken: "session 2fa token",
            is2FAEnabled: true,
        };
        spyUserServiceSignin.mockResolvedValue(mockSigninResponse);
        await expect(
            signInUser({ ...requestObject, path: "/signin" }, responseObject)
        ).resolves.toEqual(responseObject);
        expect(spyUserServiceSignin).toBeCalled();
        expect(spyUserServiceSignin).toHaveBeenCalledWith(requestObject.body);
        expect(spyUserServiceSignin.mock.results[0].value).resolves.toEqual(
            mockSigninResponse
        );
        expect(responseObject.status).toHaveBeenCalledWith(StatusCodes.OK);
        expect(responseObject.cookie).toHaveBeenCalledWith(
            "session2FAToken",
            mockSigninResponse.session2FAToken,
            expect.any(Object)
        );
        expect(responseObject.cookie.mock.calls.length).toBe(1);
        expect(responseObject.json).toHaveBeenCalledWith(
            new ResponseSuccess(
                { is2FAEnabled: mockSigninResponse.is2FAEnabled },
                "Enter Authenticator code"
            )
        );
        expect.assertions(8);
    });

    test("should return graceful message if password is incorrect", async () => {
        const mockServiceErrorObject = new ApiError(
            "Incorrect password",
            "Enter correct password",
            StatusCodes.BAD_REQUEST
        );
        spyUserServiceSignin.mockRejectedValue(mockServiceErrorObject);

        await expect(
            signInUser({ ...requestObject, path: "/signin" }, responseObject)
        ).resolves.toEqual(responseObject);
        expect(spyUserServiceSignin).toHaveBeenCalledWith(requestObject.body);
        expect(spyUserServiceSignin.mock.calls.length).toBe(1);
        expect(spyUserServiceSignin.mock.results[0].value).rejects.toEqual(
            mockServiceErrorObject
        );
        expect(responseObject.status).toHaveBeenCalledWith(
            StatusCodes.BAD_REQUEST
        );
        expect(responseObject.json).toHaveBeenCalledWith(
            new ResponseError("Incorrect password", "Enter correct password")
        );
        expect(responseObject.cookie.mock.calls.length).toBe(0);
    });

    test("", async () => { })
});
