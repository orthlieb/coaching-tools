function DEBUG_ASSERT(assertion, ...msgs) {
    if (!assertion) {
        throw msgs.reduce((cMsg, cSnippet) => (cMsg += " " + cSnippet));
    }
    return assertion;
}

let LLKEYS = [
    "mover",
    "doer",
    "influencer",
    "responder",
    "shaper",
    "producer",
    "contemplator"
];

/**
 * Given a set of Life Languages Data, sorts it into reverse order.
 * @param {object} data An object containing Life Language names and their scores.
 * @returns {array} Array of tuples, each tuple contains the name of the Life Language, followed by the score for that Life Language.
 */
function getSortedScores(data) {
    let aSortedScores = [];

    for (let cLL of LLKEYS) {
        DEBUG_ASSERT(data.hasOwnProperty(cLL), "Missing key", cLL);
        DEBUG_ASSERT(typeof data[cLL] == "number", "Invalid type for", cLL, typeof data[cLL]);

        aSortedScores.push([cLL, data[cLL]]);
    }

    return aSortedScores.sort((obj1, obj2) => {
            if (obj1[1] < obj2[1]) return -1;
            else if (obj1[1] > obj2[1]) return 1;
            return 0;
        }).reverse();
}

/**
 * Evaluates whether Overall Intensity is LOW, MODERATE, or HIGH.
 * @param {number} nValue The value to be evaluated.
 * @returns {string} Returns the evaluation of the Overall Intensity.
 */
function evaluateOverallIntensity(nValue) {
    DEBUG_ASSERT(
        typeof nValue == "number",
        "Invalid type expected number",
        nValue,
        typeof nValue
    );

    if (nValue < 15) return "\u{1F87B}";
    else if (nValue < 35) return "\u{1F87E}";
    else if (nValue < 65) return "\u{1F87A}";
    else if (nValue < 85) return "\u{1F87D}";
    return "\u{1F879}";
}

const LLCOLORS = {
    mover: "#ED1C24",
    doer: "#F6831F",
    influencer: "#FFCE0B",
    responder: "#7030A0",
    shaper: "#4472C4",
    producer: "#006838",
    contemplator: "#35B3DF"
};

/**
 * Main function to draw the Communication Indicators.
 * @param {object} data Data to be displayed.
 */
export function displayLanguageGram(data) {
    let aSortedScores = getSortedScores(data);

    document.getElementById("lg-fullname").innerText = data.fullname;

    // Life Language scores
    for (let i = 0; i < aSortedScores.length; i++) {
        let cLabel = aSortedScores[i][0];
        let nValue = aSortedScores[i][1];
        let field = document.getElementById("lg-letter-" + (i + 1));
        field.innerText = cLabel[0];
        if (i < 3) {
            field.style.backgroundColor = LLCOLORS[cLabel];
        }

        field = document.getElementById("lg-score-" + (i + 1));
        field.innerText = Math.round(nValue);
        field = document.getElementById("lg-llang-" + (i + 1));
        field.innerText = cLabel;
    }

    // Range
    let field = document.getElementById("lg-range-score");
    let nRange = aSortedScores[0][1] - aSortedScores[6][1];
    field.innerText = Math.round(nRange);

    // Overall Intensity
    field = document.getElementById("lg-overall-intensity-arrow");
    field.innerText = evaluateOverallIntensity(data.overallIntensity);
    field = document.getElementById("lg-overall-intensity-score");
    field.innerText = Math.round(data.overallIntensity);
}