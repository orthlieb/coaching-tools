// Generate test data for LanguageGram
import { CSV } from "../CSVToJSON.js";
import { DEBUG } from "../Debug.js";
import { ERROR } from "../Error.js";
import { TEST } from '../Test.js';

export function testSingle(cURLPrefix) {
    let oTest = TEST.randomPerson('Single');
    
    DEBUG.log(`GENERATED TEST DATA: ${JSON.stringify(oTest)}`);
    const cParams = Object.keys(oTest)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(oTest[key])}`)
        .join('&');

    return new URL(`${cURLPrefix}?${cParams}`);
}

export function testJSON(cURLPrefix) {
    let people = TEST.randomPeople(5, 15);
    let str = JSON.stringify(people);
    DEBUG.log(`GENERATED TEST DATA: ${str}`);
    return new URL(`${cURLPrefix}?json=${encodeURIComponent(str)}`);
}

export function testCSV(cURLPrefix) {
    let people = TEST.randomPeople(5, 15);
    let str = CSV.fromJSObject(people);
    DEBUG.log(`GENERATED CSV TEST DATA: ${str}`);
    return new URL(`${cURLPrefix}?csv=${encodeURIComponent(str)}`);
    
}

export function testInvalidJSON(cURLPrefix) {
    let aTestData = [];

    // Missing Key
    let oTest = TEST.randomPerson("Missing Key");
    delete oTest.mover;
    aTestData.push(oTest);
    
    // Invalid type
    oTest = TEST.randomPerson("Invalid Type");
    oTest.doer = "dingdingding";
    aTestData.push(oTest);
 
   // Out of range score
    oTest = TEST.randomPerson("Out of Range");
    oTest.influencer = 300;
    aTestData.push(oTest);
    
    let str = JSON.stringify(aTestData);
    DEBUG.log(`GENERATED INVALID JSON DATA: ${str}`);
    return new URL(`${cURLPrefix}?json=${encodeURIComponent(str)}`); 
}