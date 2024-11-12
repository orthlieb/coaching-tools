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
  
        // Whether a person should be shown or hidden.
        this.state = data.state ? data.state : true;

        // Give each person a unique id.
        this.id = LLPerson.idCounter++;
     }
    
    forEachLanguageScore(fCallback, callbackData) {
        COMMON.llKeys.forEach((cKey) => {
            fCallback(this[cKey], cKey, callbackData);
        });    
    } 
}