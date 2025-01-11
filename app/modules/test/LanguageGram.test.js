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

    let oTest = TEST.randomPerson("Missing name");
    delete oTest.fullName;
    aTestData.push(oTest);

    oTest = TEST.randomPerson("Missing LL Key");
    delete oTest.mover;
    aTestData.push(oTest);

    oTest = TEST.randomPerson("Invalid LL Type");
    oTest.doer = "dingdingding";
    aTestData.push(oTest);

    // Out of range score
    oTest = TEST.randomPerson("LL Score Out of Range");
    oTest.influencer = 80085;
    aTestData.push(oTest);
    
    oTest = TEST.randomPerson("Missing Overall Intensity");
    delete oTest.overallIntensity;
    aTestData.push(oTest);
    
    oTest = TEST.randomPerson("Overall Intensity Out of Range");
    oTest.overallIntensity = 80085;
    aTestData.push(oTest);
    
    let str = JSON.stringify(aTestData);
    DEBUG.log(`GENERATED INVALID JSON DATA: ${str}`);
    return new URL(`${cURLPrefix}?json=${encodeURIComponent(str)}`); 
}