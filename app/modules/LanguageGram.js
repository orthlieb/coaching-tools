// @ts-check
import { COMMON } from './Common.js';
import { STRINGS } from './Strings.js';
import { LLPerson } from './Person.js';

/**
 * Typed querySelector — returns HTMLElement so .innerText / .style resolve.
 * @template {HTMLElement} T
 * @param {ParentNode} parent
 * @param {string} selector
 * @returns {T}
 */
const $$ = (parent, selector) => /** @type {T} */ (parent.querySelector(selector));

/**
 * Class representing a LanguageGram.
 * @class
 */
export class LanguageGram {
    /**
     * Initializes a LanguageGram instance.
     * @param {string|number} suffix - Suffix to identify the LanguageGram element.
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
        $$(lgElement, '.fullname').innerText = this.person.fullName;
        if (this.person.companyName) {
            $$(lgElement, '.companyname').innerText = this.person.companyName;
        }

        // Display Life Language scores
        this.person.sortedScores.forEach((score, index) => {
            const field = $$(lgElement, '.letter-' + (index + 1));
            field.innerText = STRINGS.shorthand[score.key];
            if (index < 3) {
                field.style.backgroundColor = COMMON.colors.solid[score.key];
            }
            $$(lgElement, '.score-' + (index + 1)).innerText = String(Math.round(score.value));
            $$(lgElement, '.llang-' + (index + 1)).innerText = STRINGS.labels[score.key];
        });

        // Display range
        $$(lgElement, '.range-score').innerText = String(Math.round(this.person.range));

        // Display overall intensity
        $$(lgElement, '.overall-intensity-score').innerText = String(Math.round(this.person.overallIntensity));
        $$(lgElement, '.overall-intensity-arrow').innerHTML =
            `<i class="fa-solid ${LLPerson.scoreLevelArrows[this.person.overallIntensityLevel]}"></i>`;
    }
}
