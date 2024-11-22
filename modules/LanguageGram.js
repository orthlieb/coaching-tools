import { ERROR } from './Error.js';
import { COMMON } from './Common.js';
import { DEBUG } from './Debug.js';
import { LLPerson } from './Person.js';

/**
 * Given a set of Life Languages Data, sorts it into reverse order.
 * @param {object} data An object containing Life Language names and their scores.
 * @returns {array} Array of tuples, each tuple contains the name of the Life Language, followed by the score for that Life Language.
 */
function getSortedScores(data) {
    let aSortedScores = [];
    
    for (let cLL of COMMON.llKeys) {
        if (cLL == 'overallIntensity')
            continue;

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
    if (nValue < 15) return '&#x1F87B;';         // down
    else if (nValue < 35) return '&#x1F87E;';    // down-right
    else if (nValue < 65) return '&#x1F87A;';    // right
    else if (nValue < 85) return '&#x1F87D;';    // up-right
    return '&#x1F879;';                          // up
}

function validateData(data) {
   DEBUG.logArgs('validateData(data)', arguments);

    let person;
    
    try {
        person = new LLPerson(data);
    } catch (e) {
        DEBUG.log(e);
        ERROR.appendAlert(e, 'error');
    }

    return person;
}

/**
 * Main function to draw the Communication Indicators.
 * @param {object} data Data to be displayed.
 */
export function displayLanguageGram(cSuffix, data) {
    validateData(data);
    
    let aSortedScores = getSortedScores(data);

    let lgElement = document.getElementById('language-gram-' + cSuffix);

    let lgFullname = lgElement.querySelector('.fullname');
    lgFullname.innerText = data.fullName;
    let lgCompanyName = lgElement.querySelector('.companyname');
    if (data.companyName)
        lgCompanyName.innerText = data.companyName;

    // Life Language scores
    for (let i = 0; i < aSortedScores.length; i++) {
        let cLabel = aSortedScores[i][0];
        let nValue = aSortedScores[i][1];
        let field = lgElement.querySelector('.letter-' + (i + 1));
        field.innerText = cLabel[0];
        if (i < 3) {
            field.style.backgroundColor = COMMON.colors.solid[cLabel];
        }

        field = lgElement.querySelector('.score-' + (i + 1));
        field.innerText = Math.round(nValue);
        field = lgElement.querySelector('.llang-' + (i + 1));
        field.innerText = cLabel;
    }

    // Range
    let field = lgElement.querySelector('.range-score');
    let nRange = aSortedScores[0][1] - aSortedScores[6][1];
    field.innerText = Math.round(nRange);

    // Overall Intensity
    field = lgElement.querySelector('.overall-intensity-arrow');
    field.innerHTML = evaluateOverallIntensity(data.overallIntensity);
    field = lgElement.querySelector('.overall-intensity-score');
    field.innerText = Math.round(data.overallIntensity);
}