// Generate test data for GroupBarChart
import { DEBUG } from "../Debug.js";
import { CSV } from "../CSVToJSON.js";
import { TEST } from '../Test.js';

export function testJSON(cURLPrefix) {
    let oTestData = TEST.randomPerson();
    let str = JSON.stringify(oTestData);
    DEBUG.log(`GENERATED TEST DATA: ${str}`);
    return new URL(`${cURLPrefix}?json=${encodeURIComponent(str)}`);
}

export function testCSV(cURLPrefix) {
    let oTestData = TEST.randomPerson();
    let str = CSV.fromJSObject(oTestData);
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