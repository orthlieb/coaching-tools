// @ts-check
/**
 * Useful routines to convert to/from CSV from/to JSON.
 * @author Carl Orthlieb
 * @namespace ERROR
 */

import { DEBUG } from './Debug.js';

export const ERROR = {
    /**
     * Evaluates the assertion and if false throws an error object with the supplied message text.
     * @param {*} assertion Expression to be tested for truthiness.
     * @param {...string} msgs Additional messages concatenated for the thrown error.
     * @throws {Error} If the assertion is falsy.
     * @returns {*} Returns the assertion value when truthy.
     * @public
     */
    assert(assertion, ...msgs) {
        if (!assertion) {
            // Find out who called us.
            const stack = new Error().stack.split("\n");
            const callerInfo = stack[2].trim().match(/at (\S+) \((.*):(\d+):(\d+)\)/);
            let callerStr = "Unknown caller";
            if (callerInfo) {
                const [, functionName, file, line, col] = callerInfo;
                callerStr = `${functionName} (${file}:${line}:${col})`;
            }
            
            throw new Error(msgs.reduce((cMsg, cSnippet) => (cMsg += cSnippet)) + ' ' + callerStr);
        }
        return assertion;
    },

    /**
     * Evaluates that the supplied object is the specified type.
     * Supports 'array' (in addition to typeof's outputs) and 'character' (string of length 1).
     * NaN is treated as type 'NaN' rather than 'number'.
     * @param {*} object Value to test.
     * @param {string} type One of the JS types in typeof, plus 'array' or 'character'.
     * @param {string} msg Message prefix for the thrown error.
     * @throws {Error} If the value's type doesn't match.
     * @public
     * @example
     * ERROR.assertType([ 1 ], 'number', 'Array [1]');
     * // Throws 'Array [1] has an invalid type, expected number but found array'
     */
    assertType(object, type, msg) {
        let cType = Array.isArray(object) ? 'array' : typeof object;

        if (type == 'character') {
            this.assert(cType == 'string' && object.length == 1, `${msg} has an invalid type, expected ${type} but found ${cType} ${JSON.stringify(object)}`);
            return;
        }

        if (cType == 'number' && Number.isNaN(object))
            cType = 'NaN';

        this.assert(cType == type, `${msg} has an invalid type, expected ${type} but found ${cType} ${JSON.stringify(object)}`);
    },

    /**
     * Evaluates that the supplied value is >= the low and <= high value.
     * @param {number} value Value to be tested.
     * @param {number} low Lower boundary of the test. The supplied value must be >= this number.
     * @param {number} high Top boundary of the test. The supplied value must be <= this number.
     * @param {string} msg Message prefix for the thrown error.
     * @throws {Error} If `value` is out of range or not a number.
     * @public
     */
    assertRange(value, low, high, msg) {
        this.assertType(value, 'number', msg);
        this.assert(value >= low && value <= high, `${msg} must be a number between ${low} and ${high}, found ${value}`);
    },
    
    /**
     * Evaluates that the supplied object contains the required keys.
     * @param {object} obj Object to be tested.
     * @param {string[]} keys Array of keys to be tested against.
     * @param {string} msg Message prefix for the thrown error.
     * @throws {Error} If any required keys are missing.
     * @public
     * @example
     * let joeBlow = { mover: 10, doer: 20 };
     * ERROR.assertEveryKey(joeBlow, ['mover', 'doer', 'influencer'], 'Joe Blow');
     */
    assertEveryKey(obj, keys, msg) {
        const missing = keys.filter(key => !obj.hasOwnProperty(key));
        this.assert(missing.length == 0, `${msg} is missing required properties [${missing.join(', ')}]`);
    }
 };
