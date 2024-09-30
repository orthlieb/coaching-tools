/**
 * @module modules/Error
 * @author Carl Orthlieb
 */
import { DEBUG } from './Debug.js';

/**
 * Evaluates the assertion and if false throws an error object with the supplied message text.
 * @param {object} assertion Assertion expression to be tested.
 * @param {object} msgs Additional messages to be concatenated and then used as the error message for the error object.
 * @throws If the assertion is false.
 * @returns {boolean} Returns the evaluated expression.
 */
function assert(assertion, ...msgs) {
    if (!assertion) {
        throw new Error(msgs.reduce((cMsg, cSnippet) => (cMsg += cSnippet)));
    }
    return assertion;
}

/**
 * Evaluates that the supplied object is the specified type. 
 * Supports 'array' unlike traditional Javascript. NaN is not considered a number.
 * @param {object} object Object to test type.
 * @param {string} type One of the JS types in typeof but also supports 'array'.
 * @param {object} msg Additional message to be used at the front of the error message for the error object.
 * @throws If there is a type mismatch
 * @returns {boolean} Returns the evaluated expression.
 * @example
 * ERROR.assertType([ 1 ], 'number', 'Array [1]');
 * // Throws an error 'Array [1] has an invalid type, expected number but found array'
 */
function  assertType(object, type, msg) {
    let cType = Array.isArray(object) ? 'array' : typeof object;

    if (cType == 'number' && Number.isNaN(object))
        cType = 'nan';
    assert(cType == type, `${msg} has an invalid type, expected ${type} but found ${cType} ${JSON.stringify(object)}`);
}

/**
 * Evaluates that the supplied value is >= the low and <= high value. 
 * @param {number} value Value to be tested.
 * @param {number} low Lower boundary of the test. The supplied value must be >= this number.
 * @param {number} high Top boundary of the test. The supplied value must be <= this number.
 * @param {object} msgs Additional messages to be concatenated and then used as the error message for the error object.
 * @throws If there is a type mismatch
 * @returns {boolean} Returns the evaluated expression.
 */
function  assertRange(value, low, high, msg) {
    assert(value >= low && value <= high, `${msg} must be a number between ${low} and ${high}, found ${value}`);
}

/**
 * Creates an alert inside a document by cloning a div with the id 'alert' and prepending it to the document and revealing it.
 * @param {error} Error object from a try/catch/throw.
 */
function displayAlertInDoc(e) {
    DEBUG.log(e);
    const alert = document.getElementById('alert');
    const newAlert = alert.cloneNode(true);
    document.body.prepend(newAlert);
    newAlert.innerText = e;
    newAlert.classList.remove("hidden");
}

const alertPlaceholder = document.getElementById('liveAlertPlaceholder');
/** Deprecated */
export function appendAlert (message, type) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = [
        `<div class="alert alert-${type} alert-dismissible" role="alert">`,
        `   <div>${message}</div>`,
        '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
        '</div>'
    ].join('');

    alertPlaceholder.append(wrapper);
    console.error(message);
}

/** 
 * Global error object.
 */
export const ERROR = {
    assert: assert,
    assertType:  assertType,
    assertRange: assertRange,
    appendAlert: appendAlert,
    displayAlertInDoc: displayAlertInDoc
};
