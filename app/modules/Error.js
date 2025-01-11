/**
 * Useful routines to convert to/from CSV from/to JSON.
 * @author Carl Orthlieb
 * @namespace ERROR
 */

import { DEBUG } from './Debug.js';

export const ERROR = {
    /**
     * Evaluates the assertion and if false throws an error object with the supplied message text.
     * @param {object} assertion Assertion expression to be tested.
     * @param {object} msgs Additional messages to be concatenated and then used as the error message for the error object.
     * @throws If the assertion is false.
     * @returns {boolean} Returns the evaluated expression.
     * @public
     */
    assert(assertion, ...msgs) {
        if (!assertion) {
            throw new Error(msgs.reduce((cMsg, cSnippet) => (cMsg += cSnippet)));
        }
        return assertion;
    },

    /**
     * Evaluates that the supplied object is the specified type. 
     * Supports 'array' unlike traditional Javascript. NaN is not considered a number.
     * @param {object} object Object to test type.
     * @param {string} type One of the JS types in typeof but also supports 'array' and 'character'.
     * @param {object} msg Additional message to be used at the front of the error message for the error object.
     * @throws If there is a type mismatch
     * @returns {boolean} Returns the evaluated expression.
     * @public
     * @example
     * ERROR.assertType([ 1 ], 'number', 'Array [1]');
     * // Throws an error 'Array [1] has an invalid type, expected number but found array'
     */
    assertType(object, type, msg) {
        let cType = Array.isArray(object) ? 'array' : typeof object;

        if (type == 'character')
            return this.assert(cType == 'string' && object.length == 1, `${msg} has an invalid type, expected ${type} but found ${cType} ${JSON.stringify(object)}`);

        if (cType == 'number' && Number.isNaN(object))
            cType = 'NaN';

        this.assert(cType == type, `${msg} has an invalid type, expected ${type} but found ${cType} ${JSON.stringify(object)}`);
    },

    /**
     * Evaluates that the supplied value is >= the low and <= high value. 
     * @param {number} value Value to be tested.
     * @param {number} low Lower boundary of the test. The supplied value must be >= this number.
     * @param {number} high Top boundary of the test. The supplied value must be <= this number.
     * @param {object} msgs Additional messages to be concatenated and then used as the error message for the error object.
     * @throws If there is a type mismatch
     * @returns {boolean} Returns the evaluated expression.
     * @public
     */
    assertRange(value, low, high, msg) {
        this.assertType(value, 'number', msg);
        this.assert(value >= low && value <= high, `${msg} must be a number between ${low} and ${high}, found ${value}`);
    },
    
    /**
     * Evaluates that the supplied object contains the required keys. 
     * @param {object} obj Object to be tested
     * @param {array} keys Array of keys to be tested against.
     * @param {object} msg Additional message to be prepended if the assertion fails.
     * @throws If there is a type mismatch
     * @returns {boolean} Returns the evaluated expression.
     * @public 
     * @example
     * let joeBlow = { mover: 10, doer: 20 };
     * ERROR.assertEveryKey(joeBlow, ['mover', 'doer', 'influencer'], 'Joe Blow');
     * @public
     */
    assertEveryKey(obj, keys, msg) {
        const missing = keys.filter(key => !obj.hasOwnProperty(key));
        this.assert(missing.length == 0, `${msg} is missing required parameters [${missing.join(', ')}]`);
    }
 };
