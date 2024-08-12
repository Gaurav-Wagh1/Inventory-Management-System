const { connectDB, closeDB } = require("./config/dbconfig.js");
const { PORT } = require("./config/server-config.js");

const app = require("./app.js");

let server;
async function startServer() {
    try {
        await connectDB();
    } catch (error) {
        process.exit(1);
    }
    server = app.listen(PORT, () => {
        console.log("Server started listening on PORT :- ", PORT);
    });
}

async function closeServer() {
    console.log("Closing server connection...");
    server.close(async () => {
        try {
            await closeDB();
            process.exit(0);
        } catch (error) {
            console.log(error);
            process.exit(1);
        }
    });
}

startServer();

process.on("SIGTERM", closeServer); // close process;
process.on("SIGINT", closeServer); // CTRL + C
