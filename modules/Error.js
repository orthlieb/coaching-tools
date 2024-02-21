/**
 * Evaluates the assertion and if false throws an error object with the supplied message text.
 * @param {object} assertion Assertion expression to be tested.
 * @param {any...} msgs Additional messages to be concatenated and then used as the error message for the error object.
 * @returns {boolean} Returns the evaluated expression.
 */
export function ASSERT(assertion, ...msgs) {
    if (!assertion) {
        throw new Error(msgs.reduce((cMsg, cSnippet) => (cMsg += cSnippet)));
    }
    return assertion;
}

export function ASSERT_TYPE(object, type, msg) {
    let bType = (type === 'array') ? Array.isArray(object) : typeof object == type;
    
    if (type == 'number' && bType)
        bType = !Number.isNaN(object);
    ASSERT(bType, `${msg} has an invalid type, expected ${type} but found ${typeof object} ${JSON.stringify(object)}`);
}

export function ASSERT_RANGE(value, low, high, msg) {
    ASSERT(value >= low && value <= high, `${msg} must be a number between ${low} and ${high}, found ${value}`);
}

/**
 * Creates an alert inside a document by cloning a div with the id 'alert' and prepending it to the document and revealing it.
 * @param {error} Error object from a try/catch/throw.
 */
export function displayAlertInDoc(e) {
    console.log(e);
    const alert = document.getElementById('alert');
    const newAlert = alert.cloneNode(true);
    document.body.prepend(newAlert);
    newAlert.innerHTML = `${e} <a class="close" href="#" onclick="this.parentElement.classList.add('hidden');">&times;</a>`;
    newAlert.classList.remove("hidden");
}