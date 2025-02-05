import { ERROR } from './Error.js';
import { COMMON } from './Common.js';
import { DEBUG } from './Debug.js';
import { STRINGS } from './Strings.js';
import { LLPerson } from './Person.js';

/**
 * Class representing a LanguageGram.
 * @class
 */
export class LanguageGram {
    /**
     * Initializes a LanguageGram instance.
     * @param {string} suffix - Suffix to identify the LanguageGram element.
     * @param {object} data - Data to be displayed.
     */
    constructor(suffix, data) {
        this.suffix = suffix;
        this.data = data;
        this.person = new LLPerson(data);
    }

    /**
     * Displays the LanguageGram on the page.
     */
    display() {
        const lgElement = document.getElementById('language-gram-' + this.suffix);

        // Display full name
        lgElement.querySelector('.fullname').innerText = this.person.fullName;
        if (this.person.companyName) {
            lgElement.querySelector('.companyname').innerText = this.person.companyName;
        }

        // Display Life Language scores
        this.person.sortedScores.forEach((score, index) => {
            let field = lgElement.querySelector('.letter-' + (index + 1));
            field.innerText = STRINGS.shorthand[score.key];
            if (index < 3) {
                field.style.backgroundColor = COMMON.colors.solid[score.key];
            }
            lgElement.querySelector('.score-' + (index + 1)).innerText = Math.round(score.value);
            lgElement.querySelector('.llang-' + (index + 1)).innerText = STRINGS.labels[score.key];
        });

        // Display range
        lgElement.querySelector('.range-score').innerText = Math.round(this.person.range);

        // Display overall intensity
        lgElement.querySelector('.overall-intensity-score').innerText = Math.round(this.person.overallIntensity);
        lgElement.querySelector('.overall-intensity-arrow').innerHTML = 
            `<i class="fa-solid ${LLPerson.scoreLevelArrows[this.person.overallIntensityLevel]}"></i>`;
    }
}
