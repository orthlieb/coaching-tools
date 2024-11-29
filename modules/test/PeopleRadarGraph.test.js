// Generate test data for PeopleRadarGraph
import { DEBUG } from "../Debug.js";
import { convertJSObjectToCSV } from "../CSVToJSON.js";
import { TEST } from '../Test.js';

export function testJSON(cURLPrefix) {
    let aTestData = TEST.randomPeople(TEST.randomInt(3, 7));
    let str = JSON.stringify(aTestData);
    DEBUG.log(`GENERATED TEST DATA: ${str}`);
    return new URL(`${cURLPrefix}?json=${encodeURIComponent(str)}`);
}

export function testCSV(cURLPrefix) {
    let aTestData = TEST.randomPeople(TEST.randomInt(3, 7));
    let str = convertJSObjectToCSV(aTestData);
    DEBUG.log(`GENERATED CSV TEST DATA: ${str}`);
    return new URL(`${cURLPrefix}?csv=${encodeURIComponent(str)}`);
}

export function testInvalidData(cURLPrefix) {
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