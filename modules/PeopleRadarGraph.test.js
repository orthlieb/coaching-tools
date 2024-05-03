// Generate test data for LifeLanguageRadarGraph
import { convertJSObjectToCSV } from "./CSVToJSON.js";
import { DEBUG } from "./Debug.js";
import { TEST } from "./Test.js";

function randomTestObject() {
    return {
        fullName: TEST.generateRandomNamePair(),
        companyName: TEST.generateRandomCompanyName(),
        mover: TEST.randomScore(),
        doer: TEST.randomScore(),
        influencer: TEST.randomScore(),
        responder: TEST.randomScore(),
        shaper: TEST.randomScore(),
        producer: TEST.randomScore(),
        contemplator: TEST.randomScore(),
        overallIntensity: TEST.randomScore()
    };
}

export function testJSON(cURLPrefix) {
    let nTestSets = TEST.getRandomInt(5, 15);
    let aTestData = [];
    for (let i = 0; i < nTestSets; i++) {
        aTestData.push(randomTestObject(i));
    }
     let str = JSON.stringify(aTestData);
    DEBUG.log(`GENERATED TEST DATA: ${str}`);
    return new URL(`${cURLPrefix}?json=${encodeURIComponent(str)}`);
}

export function testCSV(cURLPrefix) {
    let nTestSets = TEST.getRandomInt(3, 7);
    let aTestData = [];
    for (let i = 0; i < nTestSets; i++) {
        aTestData.push(randomTestObject());
    }
     let str = convertJSObjectToCSV(aTestData);
    DEBUG.log(`GENERATED CSV TEST DATA: ${str}`);
    return new URL(`${cURLPrefix}?csv=${encodeURIComponent(str)}`);
}

export function testInvalidData(cURLPrefix) {
    let aTestData = [];
    
    // Missing Key
    let oTest = randomTestObject("Missing Key");
    delete oTest.mover;
    aTestData.push(oTest);

    // Invalid type
    oTest = randomTestObject("Invalid Type");
    oTest.doer = "dingdingding";
    aTestData.push(oTest);

    // Out of range score
    oTest = randomTestObject("Out of Range");
    oTest.influencer = 300;
    aTestData.push(oTest);
    
    let str = JSON.stringify(aTestData);
    DEBUG.log(`GENERATED INVALID JSON DATA: ${str}`);
    return new URL(`${cURLPrefix}?json=${encodeURIComponent(str)}`);
}