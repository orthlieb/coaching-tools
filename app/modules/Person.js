/*
 * @module modules/Person
 * @author Carl Orthlieb
 */
import { ERROR } from "./Error.js";
import { DEBUG } from "./Debug.js";
import { COMMON } from "./Common.js";
import { STRINGS } from "./Strings.js";

/**
 * @typedef {'mover' | 'doer' | 'influencer' | 'responder' | 'shaper' | 'producer' | 'contemplator'} llKey
 */

/**
 * @typedef {object} SortedScore
 * @property {llKey} key Key of the score.
 * @property {number} value Number value of the score.
 * @property {number} gap Gap between the previous score and this score.
 * @property {number} valueLevel Integer between 0 and 4 indicating the level of the score. Suitable for indexing COMMON.scoreLevelArrows.
 * @property {number} gapLevel Integer between 0 and 2 indicating the level of the gap. 
 */ 

/**
 * @typedef {Object} PersonData
 * @property {string} fullName Name of the person.
 * @property {string} [companyName] Company name for the person.
 * @property {number} mover Score for the Mover language (0-100).
 * @property {number} doer Score for the Doer language (0-100).
 * @property {number} influencer Score for the Influencer language (0-100).
 * @property {number} responder Score for the Responder language (0-100).
 * @property {number} shaper Score for the Shaper language (0-100).
 * @property {number} producer Score for the Producer language (0-100).
 * @property {number} contemplator Score for the Contemplator language (0-100).
 * @property {number} overallIntensity Score for Overall Intensity (0-100).
 * @property {number} overallIntensityLevel Calculated. Integer between 0 and 4 indicating the level of the overall intensity. Suitable for indexing COMMON.scoreLevelArrows.
 * @property {number} [acceptanceLevel] - Score for  Acceptance Level (0-100). N.B. If acceptanceLevel is present, all the other CI keys must be present. 
 * @property {number|string} [interactiveStyle] - Score for Interactive Style as a normalized number (0-300), or a string of the form <number>[I|B|E].
 * @property {number} [interactiveStyleScore] - If interactiveStyle is not present, this two part score is looked for. This part is the score (0-100).
 * @property {number} [interactiveStyleType] - If interactiveStyle is not present, this two part score is looked for. This part is the type [I|B|E].
 * @property {number} [internalControl] - Score for Internal Control (0-100).
 * @property {number} [intrusionLevel] - Score for Intrusion Level (0-100).
 * @property {number} [projectiveLevel] - Score for Projective Level (0-100).
 * @property {number} [susceptibilityToStress] - Score for Susceptibility To Stress (0-100).
 * @property {number} [learningPreferenceAuditory] - Score for Auditory Learning Preference (0-100). 
 * @property {number} [learningPreferenceVisual] - Score for Visual Learning Preference (0-100).
 * @property {number} [learningPreferencePhysical] - Score for Physical Learning Preference (0-100).'
 * @property {Array<SortedScore>} sortedScores Calculated. The scores provided, sorted in reverse order.
 * @property {number} range Calculated. Difference between the highest and the lowest sortedScore.
 * @property {number} rangeLevel - Calculated. Integer between 0 and 4 indicating the level of the range. Suitable for indexing COMMON.scoreLevelArrows.
 */

/**
 * Class representing a person and their scores.
 * @class
 */
export class LLPerson {
    static idCounter = 0;
    
    /**
     * Person class constructor
     * @param {PersonData} data Data to construct the person.
     * @returns {object} Initialized Person object.
     * @throws {Error} Throws an error if required fields are missing or invalid.
     * @constructor
     */
    constructor(data) {
        ERROR.assert("fullName" in data, "validatePerson missing parameter person.fullName");
        ERROR.assertType(data.fullName, "string", `validatePerson parameter person.fullName`);
        this.fullName = data.fullName;
        
        ERROR.assert("overallIntensity" in data, `validatePerson "${data.fullName}" missing parameter person.overallIntensity`);
        ERROR.assertType(data.overallIntensity, "number", `validatePerson "${data.fullName}" parameter person.overallIntensity`);
        this.overallIntensity = data.overallIntensity;
        this.overallIntensityLevel = COMMON.evaluateScoreLevel(this.overallIntensity);

        this.companyName = data.companyName ? data.companyName : '';
        
        COMMON.llKeys.forEach((cKey) => {
            ERROR.assert(cKey in data, `validatePerson "${data.fullName}" missing parameter person.${cKey}`);
            ERROR.assertType(data[cKey], "number", `validatePerson "${data.fullName}" parameter person.${cKey}`);
            ERROR.assertRange(data[cKey], 1, 100, `validatePerson "${data.fullName}" parameter person.${cKey}`);
            this[cKey] = data[cKey];
        });
        
        // Sort scores in descending order, calculate gap.
        let sortedScores = COMMON.llKeys.map(cKey => { 
            return { key: cKey, value: this[cKey], valueLevel: COMMON.evaluateScoreLevel(this[cKey]) }; 
        }).sort((a, b) => b.value - a.value);
        let lastScore = -1;
        this.sortedScores = sortedScores.map(score => { 
            score.gap = lastScore == -1 ? 0 : lastScore - score.value;
            score.gapLevel = score.gap < 5 ? 0 : score.gap <= 10 ? 1 : 2;
            lastScore = score.value;
            return score;
        });
        this.range = this.sortedScores[0].value - this.sortedScores.at(-1).value;
        this.rangeLevel = COMMON.evaluateScoreLevel(this.range);
  
        // Some profiles do not have Communication Indicators.
        if ('acceptanceLevel' in data) {
            // Interactive style is usually either Score/Type (interactiveStyleScore, interactiveStyleType) or a number/letter string (interactiveStyle).
            if ('interactiveStyle' in data) {
                if (typeof(data.interactiveStyle) == 'string') {
                    // String: number followed by I, B, or E
                    let is = LLPerson.parseInteractiveStyle(data.interactiveStyle);
                    data.interactiveStyleScore = is[0];
                    data.interactiveStyleType = is[1];
                    delete data.interactiveStyle;
                } else if (typeof(data.interactiveStyle == 'number')) {
                    // This is a number normalized between 0 and 300.
                    ERROR.assertRange(data.interactiveStyle, 0, 300, `validatePerson "${data.fullName}" parameter person.interactiveStyle`);
                } else {
                    ERROR.assertType(data.interactiveStyle, 'string', `validatePerson "${data.fullName}" parameter person.interactiveStyle`);
                }
            }

            if (typeof(data.interactiveStyle) == 'undefined') {
                ERROR.assert('interactiveStyleScore' in data, `validatePerson "${data.fullName}" missing parameter person.interactiveScore`);
                ERROR.assertType(data.interactiveStyleScore, 'number', `validatePerson "${data.fullName}" parameter person.interactiveStyleScore`);
                ERROR.assertRange(data.interactiveStyleScore, 1, 100, `validatePerson "${data.fullName}" parameter person.interactiveStyleScore`);

                ERROR.assert('interactiveStyleType' in data, `validatePerson "${data.fullName}" missing parameter person.interactiveType`);
                ERROR.assertType(data.interactiveStyleType, 'string', `validatePerson "${data.fullName}" parameter person.interactiveStyleType`);
                ERROR.assert(data.interactiveStyleType.length == 1, `validatePerson "${data.fullName}" parameter person.interactiveStyleType should be a single letter, found "${data.interactiveStyleType}"`);
                ERROR.assert(data.interactiveStyleType == STRINGS.ciInteractiveStyleShorthand.introvert || 
                             data.interactiveStyleType == STRINGS.ciInteractiveStyleShorthand.balanced || 
                             data.interactiveStyleType == STRINGS.ciInteractiveStyleShorthand.extrovert, `validatePerson "${data.fullName}" parameter person.interactiveStyleType should be 'I', 'B', or 'E', found "${data.interactiveStyleType}"`);

                // Turn into a normalized score of 0 - 300.
                data.interactiveStyle = LLPerson.decomposeInteractiveStyle(data.interactiveStyleScore, data.interactiveStyleType);
                delete data.interactiveStyleScore;
                delete data.interactiveStyleType;
            }

            // For professional profiles
            COMMON.ciKeys.forEach((cKey) => {
                ERROR.assert(cKey in data, `validatePerson "${data.fullName}" missing parameter person.${cKey}`);
                ERROR.assertType(data[cKey], "number", `validatePerson "${data.fullName}" parameter person.${cKey}`);
                if (cKey != 'interactiveStyle')
                    ERROR.assertRange(data[cKey], 1, 100, `validatePerson "${data.fullName}" parameter person.${cKey}`);
                this[cKey] = data[cKey];
            });
        }
        
        // Whether a person should be shown or hidden.
        this.state = typeof data.state == "boolean" ? data.state : true;

        // Give each person a unique id.
        this.id = LLPerson.idCounter++;
     }
    
    /**
     * Iterate over each language score in the person.
     * @method
     * @param {function} fCallback Callback to be called with the score, key, and supplied callbackData.
     * @param {object} callbackData Data to be supplied to the callback.
     * @public
     */
    forEachLanguageScore(fCallback, callbackData) {
        COMMON.llKeys.forEach((cKey) => {
            fCallback(this[cKey], cKey, callbackData);
        });    
    } 
    
    /**
     * Iterate over each communication indicator in the person.
     * @method
     * @param {function} fCallback Callback to be called with the indicator, key, and supplied callbackData.
     * @param {object} callbackData Data to be supplied to the callback.
     * @public
     */
    forEachCommunicationIndicator(fCallback, callbackData) {
        COMMON.ciKeys.forEach((cKey) => {
            fCallback(this[cKey], cKey, callbackData);
        });    
    }

    /**
     * Parse an interactive Style from a string.
     * @method
     * @param {string} value String of the form <number>[I|B|E]
     * @returns {array} Array whose first element is the interactive style score and the second the character code for internal, balanced, and external (IBE).
     * @public
     */
    static parseInteractiveStyle(value) {
        DEBUG.logArgs('parseInteractiveStyle', arguments);
        // First part is a number
        let nValue = parseFloat(value);
        if (Number.isNaN(nValue)) {
            return [ value, value ];
        }

        // Followed by an I, B, or E.
        return [nValue, value.slice(-1).toUpperCase()];
    }
    
    /**
     * Decompose an interactive style score/type into a normalized number from 0 - 300.
     * @method
     * @param {number} nScore Interactive style score
     * @param {number} cType Interactive style type (IBE).
     * @returns {number} Number for interactive style from 0 - 300 suitable for sorting.
     * @public
     */
    static decomposeInteractiveStyle(nScore, cType) {
        let base = { I: 0, B: 100, E: 200 };
        let n = cType == 'I' ? 100 - nScore : nScore;
        return base[cType] + n;
    }
    
     /**
     * Compose an interactive style score/type from a number from 0 - 300.
     * @method
     * @param {number} nScore Interactive style normalized score
     * @returns {array} Array of two elements, the first is a score from 0 - 100, the second is the interactive style type (I|B|E).
     * @public
     */
    static composeInteractiveStyle(nScore) {
        if (nScore > 200)
            return [ nScore - 200, STRINGS.ciInteractiveStyleShorthand.extrovert];
        else if (nScore > 100)
            return [ nScore - 100, STRINGS.ciInteractiveStyleShorthand.balanced];
        return [100 - nScore, STRINGS.ciInteractiveStyleShorthand.introvert];
    }
    
    /**
     * Creates a shorthand string to visualize the sorted order of the Life Languages for a particular person.
     * @method
     * @returns {string} Shorthand string suitable for display. Separator - is a gap > 10, Separator · is a gap between 5 and 10. No separator is < 5.
     * @public
     */
    getShorthandString() {
        let cShorthandString = "";
        let nLastScore = -1;

        this.sortedScores.forEach(score => {
            if (nLastScore != -1) {
                let nGap = nLastScore - score.value;
                // Normal
                if (nGap >= 5 && nGap <= 10) 
                    cShorthandString += "·";
                // Significant gap
                else if (nGap > 10) 
                    cShorthandString += "-";
            }
            nLastScore = score.value;

            let cChar = STRINGS.shorthand[score.key].toUpperCase();
            cShorthandString += score.value >= 50 ? cChar : cChar.toLowerCase();
        });

        return cShorthandString;
    }
}