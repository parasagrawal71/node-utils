const util = require("util");
const _ = require("lodash");

const isObject = (variable) => {
    return typeof variable === "object" && !Array.isArray(variable);
};

const isEmptyObject = (obj) => {
    if (typeof obj === "object" && !Array.isArray(obj)) {
        return Object.keys(obj).length === 0;
    }

    return true;
};

const isArray = (variable) => {
    return Array.isArray(variable);
};

const isEmptyArray = (array) => {
    if (Array.isArray(array)) {
        return array.length === 0;
    }

    return true;
};

const isString = (variable) => {
    return typeof variable === "string";
};

const deepObject = (obj) => {
    return util.inspect(obj, {
        showHidden: false,
        depth: null,
    });
};

const randomNumbers = (length) => {
    const multipleOf10s = 10 ** length;
    const min = multipleOf10s * 0.1;
    const max = multipleOf10s * 0.9;
    return Math.floor(min + Math.random() * max);
};

const omit = (obj, keys) => {
    if (!isObject(obj)) {
        throw new Error(`First argument to omit function should be object`);
    }

    if (!isArray(keys)) {
        throw new Error(`Second argument to omit function should be array`);
    }

    return _.omit(obj, keys);
};

/**
 * Create an object composed of the picked object properties
 * @param {Object} object
 * @param {string[]} keys
 * @returns {Object}
 */
const pick = (object, keys) => {
    return keys.reduce((obj, key) => {
        if (object && Object.prototype.hasOwnProperty.call(object, key)) {
            // eslint-disable-next-line no-param-reassign
            obj[key] = object[key];
        }
        return obj;
    }, {});
};

module.exports = {
    isObject,
    isEmptyObject,
    isArray,
    isEmptyArray,
    isString,
    deepObject,
    randomNumbers,
    omit,
    pick,
};
