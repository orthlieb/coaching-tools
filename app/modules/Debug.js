/**
 * Module for turning on and off debug logging.
 * @author Carl Orthlieb
 * @namespace DEBUG
 */
export const DEBUG = {
    /**
     * Set this to true to log debugging statements to the console.
     */
    bEnable: false,
    
    /**
     * Log the type of the arguments to the console.
     * @param {string} msg Message to prepend to the type information.
     * @param {object} obj Object to display the type.
     * @param {...object} Any other variables to display in the log.
     * @example
     * let foo = [1 2 3], bar = 'bingo';
     * DEBUG.logType('Logging foo and bar', foo, bar);
     * Output is "LOGTYPE Logging foo and bar Type: array Value: [1, 2, 3] bingo" 
     */
    logType: function logType(msg, obj, ...args) {
        let cType = typeof obj;
        if (cType == 'object' && Array.isArray(obj))
            cType = 'array';
        console.log('LOGTYPE', msg, 'Type:', cType, 'Value:', obj, ...args);
    },

    /**
     * Log a message to the console with caller function and line number.
     * @param {...any} args Values to display in the log.
     */
    log: function log(...args) {
        console.log(...args);
    },

   /**
     * Log the arguments of a method or function to the log.
     * @param {string} msg Message to prepend.
     * @param {...args} Arguments to the method or function.
     * @example
     * let foo = [ 1 2 3 ], bar = 42, baz = 'bingo';
     * function letItRain(foo, bar, baz) {
     *   DEBUG.logArgs('letItRain(foo, bar, baz)', arguments);
     *   Output is letItRain(foo, bar, baz) 1 2 3)
     * }
     * letItRain(foo, bar, baz);
     * Output is LOGARGS letItRain(foo, bar, baz) [1 2 3] 42 bingo 
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