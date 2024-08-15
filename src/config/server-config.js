const dotenv = require("dotenv");

dotenv.config();

const { MONGO_DB_DBNAME } = require("../constants.js");

const PORT = process.env.PORT;
const MONGO_DB_URL = process.env.MONGO_DB_URL;
const EMAIL_VERIFICATION_URL = process.env.EMAIL_VERIFICATION_URL;
const EMAIL_VERIFICATION_KEY = process.env.EMAIL_VERIFICATION_KEY;

module.exports = {
    PORT,
    MONGO_DB_URL,
    MONGO_DB_DBNAME,
    EMAIL_VERIFICATION_URL,
    EMAIL_VERIFICATION_KEY,
};
