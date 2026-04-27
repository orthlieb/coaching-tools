// @ts-check
/**
 * Module for turning on and off debug logging.
 * @author Carl Orthlieb
 * @namespace DEBUG
 */
export const DEBUG = {
    /**
     * Set this to true to log debugging statements to the console.
     */
    bEnable: true,
    
    /**
     * Log the type of the arguments to the console.
     * @param {string} msg Message to prepend to the type information.
     * @param {*} obj Object to display the type.
     * @param {...*} args Any other variables to display in the log.
     * @example
     * let foo = [1, 2, 3], bar = 'bingo';
     * DEBUG.logType('Logging foo and bar', foo, bar);
     * // Output: LOGTYPE Logging foo and bar Type: array Value: [1, 2, 3] bingo
     */
    logType: function logType(msg, obj, ...args) {
        // 'array' isn't a real typeof return; cast through string to satisfy the checker.
        /** @type {string} */
        let cType = typeof obj;
        if (cType == 'object' && Array.isArray(obj)) cType = 'array';
        console.log('LOGTYPE', msg, 'Type:', cType, 'Value:', obj, ...args);
    },

    /**
     * Log a message to the console.
     * @param {...*} args Values to display in the log.
     */
    log: function log(...args) {
        console.log(...args);
    },

    /**
     * Log the arguments of a method or function to the log.
     * @param {string} msg Message to prepend.
     * @param {IArguments|any[]} args The function's `arguments` object (or any array-like).
     * @example
     * function letItRain(foo, bar, baz) {
     *   DEBUG.logArgs('letItRain(foo, bar, baz)', arguments);
     * }
     */
    logArgs: function logArgs(msg, args) {
        console.log('LOGARGS', msg, ...args);
    }
};

/**
 * If bDebug is false, this changes all logging calls to the null function.
 */
if (!DEBUG.bEnable) {    
    Object.keys(DEBUG).forEach((key) => {
        DEBUG[key] = (...args) => {};
    });
}