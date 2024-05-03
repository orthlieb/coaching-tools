import { DEBUG } from './Debug.js';

/**
 * Evaluates the assertion and if false throws an error object with the supplied message text.
 * @param {object} assertion Assertion expression to be tested.
 * @param {object...} msgs Additional messages to be concatenated and then used as the error message for the error object.
 * @returns {boolean} Returns the evaluated expression.
 */
function assert(assertion, ...msgs) {
    if (!assertion) {
        throw new Error(msgs.reduce((cMsg, cSnippet) => (cMsg += cSnippet)));
    }
    return assertion;
}

function  assertType(object, type, msg) {
    let bType = (type === 'array') ? Array.isArray(object) : typeof object == type;
    
    if (type == 'number' && bType)
        bType = !Number.isNaN(object);
    assert(bType, `${msg} has an invalid type, expected ${type} but found ${typeof object} ${JSON.stringify(object)}`);
}

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

export const ERROR = {
    assert: assert,
    assertType:  assertType,
    assertRange: assertRange,
    appendAlert: appendAlert,
    displayAlertInDoc: displayAlertInDoc
};
