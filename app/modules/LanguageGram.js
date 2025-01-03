import { ERROR } from './Error.js';
import { COMMON } from './Common.js';
import { DEBUG } from './Debug.js';
import { STRINGS } from './Strings.js';
import { LLPerson } from './Person.js';

function validateData(data) {
   DEBUG.logArgs('validateData(data)', arguments);

    let person;
    
    try {
        person = new LLPerson(data);
    } catch (e) {
        DEBUG.log(e);
        COMMON.displayAlertInDoc(e);
    }

    return person;
}

/**
 * Main function to draw the Communication Indicators.
 * @param {object} data Data to be displayed.
 */
export function displayLanguageGram(cSuffix, data) {
    let person = validateData(data);
     
    let lgElement = document.getElementById('language-gram-' + cSuffix);

    let lgFullname = lgElement.querySelector('.fullname').innerText = person.fullName;
    if (person.companyName) {
        lgElement.querySelector('.companyname').innerText = person.companyName;
    }

    // Life Language scores
    DEBUG.log('## sortedScores', person.sortedScores);
    person.sortedScores.forEach((score, index) => {
        let field = lgElement.querySelector('.letter-' + (index + 1));
        field.innerText = STRINGS.shorthand[score.key];
        if (index < 3) {    // Larger letters are colored
            field.style.backgroundColor = COMMON.colors.solid[score.key];
        }
        lgElement.querySelector('.score-' + (index + 1)).innerText = Math.round(score.value);
        lgElement.querySelector('.llang-' + (index + 1)).innerText = STRINGS.labels[score.key];
    });
        
    // Range
    lgElement.querySelector('.range-score').innerText = Math.round(person.sortedScores[0].value - person.sortedScores[6].value);

    // Overall Intensity
    lgElement.querySelector('.overall-intensity-score').innerText = Math.round(person.overallIntensity);
    lgElement.querySelector('.overall-intensity-arrow').innerHTML = 
        `<i class="fa-solid ${COMMON.scoreLevelArrows[COMMON.evaluateScoreLevel(person.overallIntensity)]}"></i>`;
}