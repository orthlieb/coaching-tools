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
function assertRange(value, low, high, msg) {
    assert(value >= low && value <= high, `${msg} must be a number between ${low} and ${high}, found ${value}`);
}

/**
 * Creates an alert inside a document by cloning a div with the id 'alert' and prepending it to the document and revealing it.
 * @param {string} message Message to be displayed.
 * @param {string} alertType One of 'alert-danger', alert-warning', 'alert-success', or 'alert-custom'
 * @param {string} alertCustom Custom HTML to use for an icon.
 */
function displayAlertInDoc(message, alertType = 'alert-danger', alertCustom = null) {
    DEBUG.logArgs('ERROR.displayAlertInDoc', arguments);
 
    let icons = {
        "alert-danger": '<i class="fa-solid fa-diamond-exclamation me-3 fs-3"></i>',
        "alert-warning": '<i class="fa-solid fa-triangle-exclamation me-3 fs-3"></i>',
        "alert-success": '<i class="fa-solid fa-square-check me-3 fs-3"></i>',
        "alert-info": '<i class="fa-solid fa-circle-info me-3 fs-3"></i>',
        "alert-custom": alertCustom
    };

    // Create the alert dynamically
    const newAlert = document.createElement('div');
    newAlert.className = `alert alert-dismissible d-flex align-items-center m-3 ${alertType}`;
    newAlert.setAttribute('role', 'alert');
    
    // Add the icon, message, and close button
    const iconHTML = icons[alertType] || '';
    newAlert.innerHTML = `
        ${iconHTML} ${message}
        <button type="button" class="btn-close m-3" data-bs-dismiss="alert" aria-label="Close">
            <i class="fa-solid fa-circle-xmark" style="color: inherit;"></i>
        </button>
    `;
    // Prepend the new alert to the body
    document.body.prepend(newAlert);

    // Automatically remove the alert when the close button is clicked
    newAlert.querySelector('.btn-close').addEventListener('click', () => newAlert.remove());
}

/** 
 * Global error object.
 */
export const ERROR = {
    assert: assert,
    assertType:  assertType,
    assertRange: assertRange,
    displayAlertInDoc: displayAlertInDoc
};
