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
 * @property {number} valueLevel Integer between 0 and 4 indicating the level of the score. Suitable for indexing LLPerson.scoreLevelArrows.
 * @property {number} gapLevel Integer between 0 and 2 indicating the level of the gap.
 */

/**
 * @typedef {object} PersonData
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
 * @property {number} overallIntensityLevel Calculated. Integer between 0 and 4 indicating the level of the overall intensity. Suitable for indexing LLPerson.scoreLevelArrows.
 * @property {CommunicationIndicatorsData} ci Communication indicator data.
 * @property {Array<SortedScore>} sortedScores Calculated. The scores provided, sorted in reverse order.
 * @property {number} range Calculated. Difference between the highest and the lowest sortedScore.
 * @property {number} rangeLevel Calculated. Integer between 0 and 4 indicating the level of the range. Suitable for indexing LLPerson.scoreLevelArrows.
 */

/**
 * Class representing a person and their scores.
 * @class
 */
export class LLPerson {
    static _idCounter = 0;

    /**
     * Person class constructor
     * @param {PersonData} data Data to construct the person.
     * @returns {object} Initialized Person object.
     * @throws {Error} Throws an error if required fields are missing or invalid.
     * @constructor
     */
    constructor(data) {
        ERROR.assert("fullName" in data, "LLPerson missing required parameter fullName");
        this.fullName = data.fullName;
        this.companyName = data.companyName ? data.companyName : "";

        // Must have Life Language score keys
        COMMON.llKeys.forEach((cKey) => {
            ERROR.assert(cKey in data, `LLPerson "${data.fullName}" missing required parameter ${cKey}`);
            ERROR.assertRange(data[cKey], 0, 100, `LLPerson "${data.fullName}" parameter ${cKey}`);
            this[cKey] = data[cKey];
        });

        // Sort scores in descending order, calculate gap.
        let sortedScores = COMMON.llKeys
            .map((cKey) => {
                return { key: cKey, value: this[cKey], valueLevel: LLPerson.evaluateScoreLevel(this[cKey]) };
            })
            .sort((a, b) => b.value - a.value);
        let lastScore = -1;
        this.sortedScores = sortedScores.map((score) => {
            score.gap = lastScore == -1 ? 0 : lastScore - score.value;
            score.gapLevel = score.gap < 5 ? 0 : score.gap <= 10 ? 1 : 2;
            lastScore = score.value;
            return score;
        });
        this.range = this.sortedScores[0].value - this.sortedScores.at(-1).value;
        this.rangeLevel = LLPerson.evaluateScoreLevel(this.range);

        ERROR.assert(
            "overallIntensity" in data,
            `LLPerson "${data.fullName}" missing required parameter overallIntensity`
        );
        ERROR.assertRange(data.overallIntensity, 0, 100, `LLPerson "${data.fullName}" parameter overallIntensity`);
        this.overallIntensity = data.overallIntensity;
        this.overallIntensityLevel = LLPerson.evaluateScoreLevel(this.overallIntensity);

        // Whether a person should be shown or hidden.
        this.state = typeof data.state == "boolean" ? data.state : true;

        // Give each person a unique id.
        this.id = LLPerson._idCounter++;

        // Test to see if any of the Communication Indicators are present. This would be a professional profile.
        if (COMMON.ciKeys.some((key) => key in data) || 'ci' in data) {
            this.ci = new LLCommunicationIndicators(data.ci || data);
            
            // Define backward-compatible getters for COMMON.ciKeys
            Object.defineProperties(this, Object.fromEntries(
                COMMON.ciKeys.map(key => [ 
                    key, { 
                        get: () => {
                            // Extract caller information (2nd line in stack trace)
                            const stack = new Error().stack.split("\n");
                            const callerInfo = stack[2].trim().match(/at (\S+) \((.*):(\d+):(\d+)\)/);
                            let callerStr = "Unknown caller";
                            if (callerInfo) {
                                const [, functionName, file, line, col] = callerInfo;
                                callerStr = `${functionName} (${file}:${line}:${col})`;
                            }
//                            DEBUG.log(`## DEPRECATED ${callerStr} Person.${key} use Person.ci.${key}`);
                            return this.ci[key];
                        }, 
                        enumerable: true, 
                        configurable: false 
                    }]
                )
            ));
        }
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

        this.sortedScores.forEach((score) => {
            if (nLastScore != -1) {
                let nGap = nLastScore - score.value;
                // Normal
                if (nGap >= 5 && nGap <= 10) cShorthandString += "·";
                // Significant gap
                else if (nGap > 10) cShorthandString += "-";
            }
            nLastScore = score.value;

            let cChar = STRINGS.shorthand[score.key].toUpperCase();
            cShorthandString += score.value >= 50 ? cChar : cChar.toLowerCase();
        });

        return cShorthandString;
    }
    
    /**
     * Arrows to use to display different score levels
     */
    static scoreLevelArrows = [ 
        'fa-arrow-down', 'fa-arrow-down-right', 'fa-arrow-right', 'fa-arrow-up-right', 'fa-arrow-up' 
    ];
    
    /**
     * Evaluates whether Score is VERY LOW, LOW, MODERATE, HIGH or VERY HIGH.
     * Suitable for displaying arrows or colors from another array.
     * @param {number} nValue The value to be evaluated.
     * @returns {number} Returns an integer between 0 and 4 suitable for indexing into an array.
     * @public
     */
    static evaluateScoreLevel(nValue) {
        if (nValue < 15) return 0;      // bi-arrow-down "\D83E\DC7B"; "&#x1F87B;";  down
        else if (nValue < 35) return 1; // bi-arrow-down-right "&#x1F87E;"; down-right
        else if (nValue < 65) return 2; // bi-arrow-right "&#x1F87A;"; right
        else if (nValue < 85) return 3; // bi-arrow-up-right "&#x1F87D;"; up-right
    
        return 4;                       // bi-arrow-up score-arrow "\D83E\DC70"; "&#x1F879;"; up
    }
}

/**
 * @typedef {Object} CommunicationIndicatorsData
 * @property {number} acceptanceLevel - Score for  Acceptance Level (0-100). N.B. If acceptanceLevel is present, all the other CI keys must be present.
 * @property {number|string} interactiveStyle - Score for Interactive Style as a normalized number (0-300), or a string of the form <number>[I|B|E].
 * @property {number} interactiveStyleScore - If interactiveStyle is not present, this two part score is looked for. This part is the score (0-100).
 * @property {number} interactiveStyleType - If interactiveStyle is not present, this two part score is looked for. This part is the type [I|B|E].
 * @property {number} internalControl - Score for Internal Control (0-100).
 * @property {number} intrusionLevel - Score for Intrusion Level (0-100).
 * @property {number} projectiveLevel - Score for Projective Level (0-100).
 * @property {number} susceptibilityToStress - Score for Susceptibility To Stress (0-100).
 * @property {number} learningPreferenceAuditory - Score for Auditory Learning Preference (0-100).
 * @property {number} learningPreferenceVisual - Score for Visual Learning Preference (0-100).
 * @property {number} learningPreferencePhysical - Score for Physical Learning Preference (0-100).
 * @property {array} preferredLearningPreference - Array of keys (learningPreferenceAuditory, learningPreferenceVisual, learningPreferencePhysical) indicating which learning styles are preferred (although less common, there can be ties).
 */

/**
 * CommunicationIndicators class constructor
 * @param {CommunicationIndicatorsData} data Data to construct the CIs.
 * @returns {object} Initialized CommunicationIndicators object.
 * @throws {Error} Throws an error if required fields are missing or invalid.
 * @constructor
 */
export class LLCommunicationIndicators {
    constructor(data) {
        if (typeof data.interactiveStyle == "string") {
            // Combined string of <number>[I | B | E]. Anachronistic.
            let is = this._parseInteractiveStyle(data.interactiveStyle);
            data.interactiveStyleScore = is[0];
            data.interactiveStyleType = is[1];
        }

        let isKeys = ["interactiveStyleScore", "interactiveStyleType"];
        if (isKeys.some((key) => data.hasOwnProperty(key))) {
            // This means that there should be a decomposed Interactive Style score and type.
            ERROR.assertEveryKey(data, isKeys, 'CommunicationIndicators');
            let cType = this._validateInteractiveStyleType(data.interactiveStyleType);
            data.interactiveStyle = this._normalizeInteractiveStyle(data.interactiveStyleScore, cType);
            delete data.interactiveStyleScore;
            delete data.interactiveStyleType;
        }

        // Must have all Communication Indicator keys
        COMMON.ciKeys.forEach((cKey) => {
            ERROR.assert(cKey in data, `CommunicationIndicators missing required parameter ${cKey}`);
            ERROR.assertRange(data[cKey], 0, cKey == "interactiveStyle" ? 300 : 100, 
                `CommunicationIndicators parameter ${cKey}`);
            this[cKey] = data[cKey];
        });
        
        // Calculated values
        this.preferredLearningStyle = this._evaluateLearningPreference();
    } 
    
    /**
     * Parse an interactive Style from a string. There is no error checking here on values or characters.
     * Needs to happen in the caller.
     * @method
     * @param {string} cInteractiveStyle String of the form <number>[I|B|E]
     * @returns {array} Array whose first element is the interactive style score and the second the character code for internal, balanced, and external (IBE).
     * @private
     */
    _parseInteractiveStyle(cInteractiveStyle) {
        DEBUG.logArgs("_parseInteractiveStyle", arguments);
        // First part is a number
        let nValue = parseFloat(cInteractiveStyle);
        if (Number.isNaN(nValue)) {
            return [cInteractiveStyle, cInteractiveStyle];
        }
        // Followed by an I, B, or E.
        return [nValue, cInteractiveStyle.slice(-1).toUpperCase()];
    }

    /**
     * Validates an interactive style type character into an index 0-2. Returns -1 if invalid. The character can be localized.
     * @parameter {string} cType Incoming character to check.
     * @returns {string} Character of I | B | E.
     * @throws {error} If cType is not a single character or not I | B | E or their localized variants.
     * @private
     */
    _validateInteractiveStyleType(cType) {
        ERROR.assertType(cType, "character", `CommunicationIndicators _validateInteractiveStyleType`);
        let validTypes = { I: "I", B: "B", E: "E" };
        validTypes[STRINGS.ciInteractiveStyleShorthand.introvert] = "I";
        validTypes[STRINGS.ciInteractiveStyleShorthand.balanced] = "B";
        validTypes[STRINGS.ciInteractiveStyleShorthand.extrovert] = "E";

        ERROR.assert(cType in validTypes, `CommunicationIndicators _validateInteractiveStyleType should be I | B | E but found ${cType}`);
        return validTypes[cType];
    }

    /**
     * Normalize an interactive style score/type into a normalized number from 0 - 300.
     * @method
     * @param {number} nScore Interactive style score
     * @param {number} cType Interactive style type (IBE).
     * @returns {number} Normalized score for interactive style from 0 - 300 suitable for sorting.
     * @throws {error} If nScore is not a number or not in range.
     * @private
     */
    _normalizeInteractiveStyle(nScore, cType) {
        ERROR.assertRange(nScore, 1, 100, 'LLCommunicationIndicators._normalizeInteractiveStyle nScore');
        cType = this._validateInteractiveStyleType(cType);
        let base = { I: 0, B: 100, E: 200 };
        return base[cType] + (cType == "I" ? 100 - nScore : nScore);
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
     * @static
     */
    static composeInteractiveStyle(nNormalizedScore) {
        ERROR.assertRange(nNormalizedScore, 1, 300, 'LLCommunicationIndicators.composeInteractiveStyle nNormalizedScore');
        if (nNormalizedScore > 200) 
            return [nNormalizedScore - 200, STRINGS.ciInteractiveStyleShorthand.extrovert];
        else if (nNormalizedScore > 100) 
            return [nNormalizedScore - 100, STRINGS.ciInteractiveStyleShorthand.balanced];
        return [100 - nNormalizedScore, STRINGS.ciInteractiveStyleShorthand.introvert];
    }

  /**
     * Evaluates whether CI Score is LOW, MODERATE, HIGH.
     * Suitable for displaying arrows or colors from another array.
     * @param {number} nValue The value to be evaluated.
     * @returns {number} Returns an integer between 0 and 2 suitable for indexing into an array.
     * @public
     */
    static evaluateScoreLevel(nValue) {
        if (nValue < 35) return 0;
        else if (nValue < 65) return 1;
        return 2;
    }

    /**
     * Arrows to use to display different CI score levels
     * @public
     */
    static scoreLevelArrows = [ 
        'fa-arrow-down', 'fa-arrow-right', 'fa-arrow-up' 
    ];
    
    /**
     * Evaluates Learning Preferences and returns an array of dominant preference keys.
     * @method
     * @returns {array} Returns an array with keys that are considered dominant from COMMON.ciKeys.
     * @private
     */
    _evaluateLearningPreference() {
        let keys = ["learningPreferenceAuditory", "learningPreferencePhysical", "learningPreferenceVisual"];

        // Find the max value
        let nMax = keys.reduce((accum, key) => (this[key] > accum ? this[key] : accum), 0);

        // Find keys that match max value
        let matches = keys.reduce((accum, key) => {
            if (this[key] === nMax) accum.push(key);
            return accum;
        }, []);
        
        return matches;
    }
}