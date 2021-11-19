const mongoose = require("mongoose");

// CUSTOM IMPORTS
const utilConfig = require("../Config");
const appLogger = require("./appLogger");

module.exports.connectDatabase = () => {
    return mongoose
        .connect(utilConfig.get().database.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false,
        })
        .then(() => {
            appLogger.debug("Successfully connected to the database");
        })
        .catch((error) => {
            appLogger.error({ msg: "Could not connect to the database. Shutting down server now...", error });
            process.exit(1);
        });
};

const closeDatabase = () => {
    mongoose.connection.close(() => {
        appLogger.debug("Database connection disconnected through app termination");
        process.exit(0); // REQUIRED
    });
};

/*
 *
 * *********************************************** CONNECTION EVENTS ******************************************** //
 */
// When successfully connected
mongoose.connection.on("connected", () => {
    appLogger.debug("Database connection opened");
});

// If the connection throws an error
mongoose.connection.on("error", (error) => {
    // appLogger.error({ msg: "Database connection error: ", error });
});

// When the connection is disconnected
mongoose.connection.on("disconnected", () => {
    appLogger.debug("Database connection disconnected");
});

// If the Node process ends, close the database connection
process.on("SIGINT", closeDatabase);
process.on("SIGTERM", () => closeDatabase);
