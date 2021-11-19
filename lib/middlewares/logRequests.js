// CUSTOM IMPORTS
const { appLogger } = require("../utils");
const utilConfig = require("../Config");

const logRequests = (req, res, next) => {
    if (utilConfig.get().NODE_ENV !== "test") {
        appLogger.request(req);
    }

    next();
};

module.exports = logRequests;
