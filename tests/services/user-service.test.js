const { UserService } = require("../../src/services/user-service.js");
const { User } = require("../../src/models/Users.js");
const { CustomerDetail } = require("../../src/models/CustomerDetails.js");

jest.mock("../../src/models/Users.js");
jest.mock("../../src/models/CustomerDetails.js");

let userService;

beforeAll(() => {
    userService = new UserService();
});

afterEach(() => {
    jest.restor;
});

describe("signup user", () => {
    const dataToPass = { email: "dummy@email.com", password: "dummyPassword" };
    const dataToGet = {
        id: "dummyId",
        email: "dummy@email.com",
        role: "customer",
    };

    test("should create user account with default customer role", async () => {
        User.findOne.mockResolvedValue(null); // no such user exist, hence null;
        User.create.mockResolvedValue({
            ...dataToGet,
            generateRefreshToken: jest.fn(() => "refresh token"),
            generateAccessToken: jest.fn(() => "access token"),
            save: jest.fn(() => {}),
            safeUser: dataToGet,
        });

        const response = await userService.signup(dataToPass);

        expect(User.findOne).toHaveBeenCalledWith({ email: dataToPass.email });
        expect(User.create).toHaveBeenCalledWith(dataToPass);
        expect(response).toEqual({
            accessToken: "access token",
            refreshToken: "refresh token",
            userData: dataToGet,
        });
    });

    test("should throw error if user already exists", async () => {
        User.findOne.mockResolvedValue(dataToGet); // user already exists;

        await expect(userService.signup(dataToPass)).rejects.toThrowError(
            "User with this email already exists!"
        );
    });
});

describe("signin user", () => {
    const dataToPass = { email: "dummy@email.com", password: "dummyPassword" };
    const dataToGet = {
        id: "dummyId",
        email: "dummy@email.com",
        role: "customer",
    };

    test("successful customer signin with email and password", async () => {
        User.findOne.mockResolvedValue({
            ...dataToGet,
            ...dataToPass,
            comparePassword: jest.fn(async (pass) => true), // password is correct
            generateRefreshToken: jest.fn(() => "refresh token"),
            generateAccessToken: jest.fn(() => "access token"),
            save: jest.fn(() => {}),
            safeUser: dataToGet,
        });

        await expect(userService.signIn(dataToPass)).resolves.toEqual({
            accessToken: "access token",
            refreshToken: "refresh token",
        });
    });

    test("throw error if no user found", async () => {
        User.findOne.mockResolvedValue(null); // no user with given credentials;
        await expect(userService.signIn(dataToPass)).rejects.toThrowError(
            "No user found, signup first!"
        );
    });

    test("throw error if password is incorrect", async () => {
        User.findOne.mockResolvedValue({
            ...dataToGet,
            ...dataToPass,
            comparePassword: jest.fn(async (pass) => false), // password is incorrect
        });

        await expect(userService.signIn(dataToPass)).rejects.toThrowError(
            "Enter correct password"
        );
    });
});

describe("refresh tokens", () => {
    let dataToPass;
    beforeEach(() => {
        dataToPass = { userId: "dummy Id", refreshToken: "refresh token" };
    });

    test("should refresh the access token", async () => {
        const mockGenerateAccessToken = jest.fn(async () => "new access token");
        const mockGenerateRefreshToken = jest.fn(
            async () => "new refresh token"
        );
        User.findById.mockResolvedValue({
            id: dataToPass.userId,
            refreshToken: dataToPass.refreshToken,
            generateRefreshToken: mockGenerateRefreshToken,
            generateAccessToken: mockGenerateAccessToken,
            save: jest.fn(() => {}),
        });

        await expect(
            userService.refreshAccessToken(dataToPass)
        ).resolves.toEqual({
            refreshToken: "new refresh token",
            accessToken: "new access token",
        });
        expect(User.findById).toHaveBeenCalledWith(dataToPass.userId);
        expect(mockGenerateAccessToken).toBeCalled();
        expect(mockGenerateRefreshToken).toBeCalled();
    });

    test("should throw error if passed token is invalid", async () => {
        User.findById.mockResolvedValue({
            id: dataToPass.userId,
            refreshToken: "different refresh token", // passed token doesn't match with saved token;
            save: jest.fn(() => {}),
        });

        await expect(
            userService.refreshAccessToken(dataToPass)
        ).rejects.toThrowError(
            "Invalid token, sign in again to access account"
        );
    });
});

describe("update user details", () => {
    let userData, userDetails;
    beforeEach(() => {
        userData = { userId: "dummy Id", refreshToken: "refresh token" };

        // data to update;
        userDetails = {
            firstName: "updatedFName",
            lastName: "updatedLName",
            phoneNumber: "updatedPhone",
            address: "updatedAddress",
        };
    });

    test("successfully update the customer details", async () => {
        userData.role = "customer";

        User.findById.mockResolvedValue({
            id: userData.userId,
            role: "customer",
            save: jest.fn(() => {}),
        });

        CustomerDetail.findOne.mockResolvedValue({
            id: "customer details id",
            firstName: "demoFname",
            lastName: "demoLname",
            address: "demoAddress",
            phoneNumber: "demoPhone",
            save: () => {},
        });

        CustomerDetail.findById.mockResolvedValue({
            ...userDetails,
            safeDetails: { id: userData.userId, ...userDetails },
        });

        const response = await userService.updateDetails(userData, userDetails);

        expect(User.findById).toHaveBeenCalledWith(userData.userId);
        expect(CustomerDetail.findOne).toHaveBeenCalledWith({
            user: userData.userId,
        });
        expect(CustomerDetail.findById).toHaveBeenCalledWith(
            "customer details id"
        );
        expect(response).toBeDefined();
        expect(response).toEqual({ id: userData.userId, ...userDetails });
    });
});
