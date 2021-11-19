const winston = require("winston");
const { format } = require("winston");
const rTracer = require("cls-rtracer");
const httpStatus = require("http-status");
winston.transports.DailyRotateFile = require("winston-daily-rotate-file");
const chalk = require("chalk");

// CUSTOM IMPORTS
const { isObject, isEmptyObject, isString, isEmptyArray, deepObject, omit } = require("./helperFunctions");
const utilConfig = require("../Config");
/*
 *
 * ******************************************** LOGGING LEVELs *********************************************** //
 */
const appConfig = {
    levels: {
        info: 0,
        error: 1,
        warn: 2,
        debug: 3,
        request: 4,
    },
    colors: {
        info: "green",
        error: "red",
        warn: "yellow",
        debug: "blue",
        request: "magenta",
    },
};

winston.addColors(appConfig.colors);

/*
 *
 * ********************************************** LOG FORMATs *********************************************** //
 */
const commonLogFormat = (log, isConsoleLog) => {
    const { timestamp, message, level } = log;
    const APP_NAME = utilConfig.get().logger.APP_NAME;

    const requestId = rTracer.id();
    const requestIdFirstPart = requestId && requestId.split("-") && `${requestId.split("-")[0]}-x`;
    const firstHalfOfFirstLineOfLog = requestId
        ? `[${APP_NAME}] [${timestamp}] [request-id: ${requestId}] [${level}]`
        : `[${APP_NAME}] [${timestamp}] [${level}]`;

    if (level && level.includes("request")) {
        if (!isObject(message)) {
            return `${firstHalfOfFirstLineOfLog} : message is not an object or a req object`;
        }

        let req = message;
        if (Object.keys(message).includes("req")) {
            req = message.req;
        }

        const firstLineOfRequestLog = `${firstHalfOfFirstLineOfLog} : ${req.method} ${req.originalUrl && req.originalUrl.split("?")[0]} - ${
            req.hostname
        }`;
        const headersInLog = !isEmptyObject(req.headers) ? `\n\t***HEADERS***\t========>\t${deepObject(req.headers)}` : "";
        const queryParamsInLog = !isEmptyObject(req.query) ? `\n\t***QUERY PARAMETERS***\t========>\t${deepObject(req.query)}` : "";
        const requestBodyInLog = !isEmptyObject(req.body) ? `\n\t***REQUEST BODY***\t========>\t${deepObject(req.body)}` : "";

        if (isConsoleLog) {
            return utilConfig.get().logger.SHOW_COMPLETE_ERROR_IN_CONSOLE
                ? `${firstLineOfRequestLog.replace(requestId, requestIdFirstPart)}${headersInLog}${queryParamsInLog}${requestBodyInLog}`
                : firstLineOfRequestLog.replace(requestId, requestIdFirstPart);
        }

        return `${firstLineOfRequestLog}${headersInLog}${queryParamsInLog}${requestBodyInLog}`;
    } else {
        const isInfoOrWarnLevel = level ? level.includes("info") || level.includes("warn") : false;
        if (!isObject(message) && !isString(message)) {
            return `${firstHalfOfFirstLineOfLog}${" ".repeat(isInfoOrWarnLevel ? 4 : 3)}: message is not an object or a string`;
        }

        let msg = "";
        let errorOrInfo = {};
        if (isString(message)) {
            msg = message;
        }

        const isErrorLevel = level && level.includes("error");
        if (isObject(message)) {
            msg = message.msg;
            message.error = omit(message.error, ["request", "response"]); // TODO: check response.data is required?
            errorOrInfo = isErrorLevel ? message.error : message.info;
        }

        const isResponse = msg && msg.includes("[RESPONSE]");
        let firstLineOfDBLog = "";
        if (isResponse) {
            const { statusCode } = message;
            const is400Or500Series = String(statusCode).startsWith(4) || String(statusCode).startsWith(5);
            msg = isConsoleLog
                ? `${msg} ${is400Or500Series ? chalk.red(statusCode) : chalk.green(statusCode)} ${httpStatus[statusCode]}`
                : `${msg} ${statusCode} ${httpStatus[statusCode]}`;
            firstLineOfDBLog = `${firstHalfOfFirstLineOfLog}${" ".repeat(isInfoOrWarnLevel ? 4 : 3)}: ${msg}`;
        } else {
            firstLineOfDBLog = `${firstHalfOfFirstLineOfLog}${" ".repeat(isInfoOrWarnLevel ? 4 : 3)}: ${msg}`;
        }
        const objOrArrInDBLog =
            !isEmptyObject(errorOrInfo) || !isEmptyArray(errorOrInfo)
                ? `\n\t***${isErrorLevel ? "ERROR" : "INFO"}***\t========>\t${deepObject(errorOrInfo)}`
                : "";

        if (isConsoleLog) {
            return utilConfig.get().logger.SHOW_COMPLETE_ERROR_IN_CONSOLE
                ? `${firstLineOfDBLog.replace(requestId, requestIdFirstPart)}${objOrArrInDBLog}`
                : firstLineOfDBLog.replace(requestId, requestIdFirstPart);
        }

        return `${firstLineOfDBLog}${objOrArrInDBLog}`;
    }
};

const fileLogFormat = () => {
    return format.combine(
        format.timestamp({
            format: "DD/MM/YYYY hh:mm:ss A",
        }),
        format.printf(commonLogFormat),
        format.errors({ stack: true })
    );
};

const consoleLogFormat = () => {
    return format.combine(
        format.colorize(),
        format.timestamp({
            format: "DD/MM/YYYY hh:mm:ss A",
        }),
        // format.align(), // IMPORTANT: Don't use this
        format.printf((log) => {
            return commonLogFormat(log, true);
        }),
        format.errors({ stack: true })
    );
};

/*
 *
 * ******************************************** CREATE CUSTOM LOGGER *********************************************** //
 */
const appLogger = winston.createLogger({
    levels: appConfig.levels,
    transports: [
        // Save logs upto level 'request' in appConfig.levels to logs folder
        new winston.transports.Console({
            level: "request",
            format: consoleLogFormat(),
            silent: utilConfig.get().logger.DISABLE_CONSOLE_LOG,
        }),
        new winston.transports.DailyRotateFile({
            filename: "%DATE%.log",
            dirname: `${process.cwd()}/logs`,
            datePattern: "YYYY-MM-DD",
            level: "request",
            format: fileLogFormat(),
            maxFiles: "7d",
            maxFiles: "10d",
            auditFile: `${process.cwd()}/logs/audit.json`,
        }),
    ],
});

module.exports = appLogger;
