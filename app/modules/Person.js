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
        ERROR.assert('fullName' in data, 'LLPerson missing required parameter fullName');
        this.fullName = data.fullName;
        this.companyName = data.companyName ? data.companyName : '';
        
        // Must have Life Language score keys
        COMMON.llKeys.forEach((cKey) => {
            ERROR.assert(cKey in data, `LLPerson "${data.fullName}" missing required parameter ${cKey}`);
            ERROR.assertRange(data[cKey], 1, 100, `LLPerson "${data.fullName}" parameter ${cKey}`);
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
  
        ERROR.assert('overallIntensity' in data, `LLPerson "${data.fullName}" missing required parameter overallIntensity`);
        ERROR.assertRange(data.overallIntensity, 0, 100, `LLPerson "${data.fullName}" parameter overallIntensity`);
        this.overallIntensity = data.overallIntensity;
        this.overallIntensityLevel = COMMON.evaluateScoreLevel(this.overallIntensity);

        // Whether a person should be shown or hidden.
        this.state = typeof data.state == "boolean" ? data.state : true;

        // Give each person a unique id.
        this.id = LLPerson.idCounter++;
        
       // XXX Probably should factor out the CI keys into their own structure
        // Test to see if any of the Communication Indicators are present. This would be a professional profile.
        if (COMMON.ciKeys.some(key => key in data)) {
            if (typeof(data.interactiveStyle) == 'string') {
                // Combined string of <number>[I | B | E]. Anachronistic.
                let is = this.parseInteractiveStyle(data.interactiveStyle);
                data.interactiveStyleScore = is[0];
                data.interactiveStyleType = is[1];
            }
            
            let isKeys = ['interactiveStyleScore', 'interactiveStyleType'];
            if (isKeys.some(key => data.hasOwnProperty(key))) {
                // This means that there should be a decomposed Interactive Style score and type.
                ERROR.assertEveryKey(data, isKeys, `LLPerson "${data.fullName}"`);
                let cType = this.validateInteractiveStyleType(data.interactiveStyleType);
                data.interactiveStyle = this.normalizeInteractiveStyle(data.interactiveStyleScore, cType);
                delete data.interactiveStyleScore;
                delete data.interactiveStyleType;
            }
            
            // Must have all Communication Indicator keys
            COMMON.ciKeys.forEach((cKey) => {
                ERROR.assert(cKey in data, `LLPerson "${data.fullName}" missing required parameter ${cKey}`);
                ERROR.assertRange(data[cKey], 1, (cKey == 'interactiveStyle' ? 300 : 100), `LLPerson "${data.fullName}" parameter ${cKey}`);
                this[cKey] = data[cKey];
            });
        }
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
     * Parse an interactive Style from a string. There is no error checking here on values or characters. 
     * Needs to happen in the caller.
     * @method
     * @param {string} cInteractiveStyle String of the form <number>[I|B|E]
     * @returns {array} Array whose first element is the interactive style score and the second the character code for internal, balanced, and external (IBE).
     * @public
     */
    parseInteractiveStyle(cInteractiveStyle) {
        DEBUG.logArgs('parseInteractiveStyle', arguments);
        // First part is a number
        let nValue = parseFloat(cInteractiveStyle);
        if (Number.isNaN(nValue)) {
            return [ cInteractiveStyle, cInteractiveStyle ];
        }
        // Followed by an I, B, or E.
        return [nValue, cInteractiveStyle.slice(-1).toUpperCase()];
    }
    
    /**
     * Validates an interactive style type character into an index 0-2. Returns -1 if invalid. The character can be localized.
     * @parameter {string} cType Incoming character to check.
     * @returns {string} Character of I | B | E.
     * @throws {error} If cType is not a single character or not I | B | E or their localized variants.
     * @public
     */
    validateInteractiveStyleType(cType) {
        ERROR.assertType(cType, 'character', `LLPerson "${this.fullName}" parseInteractiveStyleType`);
        let validTypes = { I: 'I', B: 'B', E: 'E' };
        validTypes[STRINGS.ciInteractiveStyleShorthand.introvert] = 'I';
        validTypes[STRINGS.ciInteractiveStyleShorthand.balanced] = 'B';
        validTypes[STRINGS.ciInteractiveStyleShorthand.extrovert] = 'E';
 
        ERROR.assert(cType in validTypes, `LLPerson "${this.fullName}" parseInteractiveStyleType should be I | B | E but found ${cType}`);
        return validTypes[cType];
    }
            
    /**
     * Normalize an interactive style score/type into a normalized number from 0 - 300.
     * @method
     * @param {number} nScore Interactive style score
     * @param {number} cType Interactive style type (IBE).
     * @returns {number} Normalized score for interactive style from 0 - 300 suitable for sorting.
     * @throws {error} If nScore is not a number or not in range.
     * @public
     */
    normalizeInteractiveStyle(nScore, cType) {
        ERROR.assertRange(nScore, 1, 100, `LLPerson "${this.fullName}" normalizeInteractiveStyle nScore`);
        cType = this.validateInteractiveStyleType(cType);
        let base = { I: 0, B: 100, E: 200 };
        return base[cType] + ((cType == 'I') ? 100 - nScore : nScore);
    }
    
     /**
     * Compose an interactive style score/type from a normalized IS number from 0 - 300. It is composed into a space 
     * of three bands: introvert, balanced, and extrovert, each with a range of 0 - 100. 
     * Paradoxically, the introvert band is reversed. e.g. 100 - 0 Introvert, 0 - 100 Balanced, 0 - 100 Extrovert
     * @method
     * @param {number} nNormalizedScore Interactive style normalized score
     * @returns {array} Array of two elements, the first is a score from 0 - 100, the second is the interactive style type (I|B|E).
     * @throws {error} If nNormalizedScore is not a number or not in range of 0 to 300.
     * @public
     */
    static composeInteractiveStyle(nNormalizedScore) {
        ERROR.assertRange(nNormalizedScore, 1, 300, `LLPerson "${this.fullName}" composeInteractiveStyle nNormalizedScore`);
        if (nNormalizedScore > 200)
            return [ nNormalizedScore - 200, STRINGS.ciInteractiveStyleShorthand.extrovert];
        else if (nNormalizedScore > 100)
            return [ nNormalizedScore - 100, STRINGS.ciInteractiveStyleShorthand.balanced];
        return [ 100 - nNormalizedScore, STRINGS.ciInteractiveStyleShorthand.introvert ];
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