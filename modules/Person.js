import { ERROR } from "./Error.js";
import { DEBUG } from "./Debug.js";
import { COMMON } from "./Common.js";

export class LLPerson {
    static idCounter = 0;
    
    constructor(data) {
        ERROR.assert("fullName" in data, "validatePerson missing parameter person.fullName");
        ERROR.assertType(data.fullName, "string", `validatePerson "${data.fullName}" parameter person.fullName`);
        this.fullName = data.fullName;
        
        ERROR.assert("overallIntensity" in data, "validatePerson missing parameter person.overallIntensity");
        ERROR.assertType(data.overallIntensity, "number", `validatePerson "${data.fullName}" parameter person.overallIntensity`);
        this.overallIntensity = data.overallIntensity;

        this.companyName = data.companyName ? data.companyName : '';
        
        COMMON.llKeys.forEach((cKey) => {
            ERROR.assert(cKey in data, `validatePerson "${data.fullName}" missing parameter person.${cKey}`);
            ERROR.assertType(data[cKey], "number", `validatePerson "${data.fullName}" parameter person.${cKey}`);
            ERROR.assertRange(data[cKey], 1, 100, `validatePerson "${data.fullName}" parameter person.${cKey}`);
            this[cKey] = data[cKey];
        });
  
        // Interactive style is usually either Score/Type (interactiveStyleScore, interactiveStyleType) or a number/letter string (interactiveStyle).
        if ('interactiveStyle' in data) {
            ERROR.assertType(data.interactiveStyle, 'string', `validatePerson "${data.fullName}" parameter person.interactiveStyle`);
            let is = LLPerson.parseInteractiveStyle(data.interactiveStyle);
            data.interactiveStyleScore = is[0];
            data.interactiveStyleType = is[1];
            delete data.interactiveStyle;
        }

        ERROR.assert('interactiveStyleScore' in data, `validatePerson "${data.fullName}" missing parameter person.interactiveScore`);
        ERROR.assert(data.interactiveStyleScore, 'number', `validatePerson "${data.fullName}" parameter person.interactiveStyleScore`);
        ERROR.assertType(data.interactiveStyleScore, 'number', `validatePerson "${data.fullName}" parameter person.interactiveStyleScore`);
        ERROR.assertRange(data.interactiveStyleScore, 1, 100, `validatePerson "${data.fullName}" parameter person.interactiveStyleScore`);

        ERROR.assert('interactiveStyleType' in data, `validatePerson "${data.fullName}" missing parameter person.interactiveType`);
        ERROR.assertType(data.interactiveStyleType, 'string', `validatePerson "${data.fullName}" parameter person.interactiveStyleType`);
        ERROR.assert(data.interactiveStyleType.length == 1, `validatePerson "${data.fullName}" parameter person.interactiveStyleType should be 'I', 'B', or 'E', found "${data.interactiveStyleType}"`);
        ERROR.assert(data.interactiveStyleType == 'I' || data.interactiveStyleType == 'B' || data.interactiveStyleType == 'E', `validatePerson "${data.fullName}" parameter person.interactiveStyleType should be 'I', 'B', or 'E', found "${data.interactiveStyleType}"`);

        // Turn into a normalized score of 0 - 300.
        data.interactiveStyle = LLPerson.decomposeInteractiveStyle(data.interactiveStyleScore, data.interactiveStyleType);
        delete data.interactiveStyleScore;
        delete data.interactiveStyleType;
        
        // For professional profiles
        COMMON.ciKeys.forEach((cKey) => {
            ERROR.assert(cKey in data, `validatePerson "${data.fullName}" missing parameter person.${cKey}`);
            ERROR.assertType(data[cKey], "number", `validatePerson "${data.fullName}" parameter person.${cKey}`);
            if (cKey != 'interactiveStyle')
                ERROR.assertRange(data[cKey], 1, 100, `validatePerson "${data.fullName}" parameter person.${cKey}`);
            this[cKey] = data[cKey];
        });
       
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
            return [ nScore - 200, 'E'];
        if (nScore > 100)
            return [ nScore - 100, 'B'];
        return [100 - nScore, 'I'];
    }
}