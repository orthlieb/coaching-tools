// Generate test data for Communication Indicators

import { ERROR } from "./Error.js";
import { DEBUG } from "./Debug.js";
import { TEST } from './Test.js';

import { convertJSObjectToCSV } from "./CSVToJSON.js";

function randomTestObject(cSuffix = "") {
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
        overallIntensity: TEST.randomScore(),
        acceptanceLevel: TEST.randomScore(),
        interactiveStyle: TEST.randomScore() + TEST.randomInteractiveStyle(),
        internalControl: TEST.randomScore(),
        intrusionLevel: TEST.randomScore(),
        projectiveLevel: TEST.randomScore(),
        susceptibilityToStress: TEST.randomScore(),
        learningPreferenceVisual: TEST.randomScore(),
        learningPreferenceAuditory: TEST.randomScore(),
        learningPreferencePhysical: TEST.randomScore(),
        showForensics: TEST.randomBool()
    };
}

export function testSingle(cURLPrefix) {
    let oTest = randomTestObject("Single");

    DEBUG.log(`GENERATED TEST DATA: ${JSON.stringify(oTest)}`);
    const cParams = Object.keys(oTest)
        .map(
            (key) =>
                `${encodeURIComponent(key)}=${encodeURIComponent(oTest[key])}`
        )
        .join("&");

    return new URL(`${cURLPrefix}?${cParams}`);
}

export function testJSON(cURLPrefix) {
    let nTestSets = TEST.getRandomInt(1, 10);
    let aTestData = [];
    for (let i = 0; i < nTestSets; i++) {
        aTestData.push(randomTestObject(i));
    }
    let str = JSON.stringify(aTestData);
    DEBUG.log(`GENERATED TEST DATA: ${str}`);
    return new URL(`${cURLPrefix}?json=${encodeURIComponent(str)}`);
}

export function testCSV(cURLPrefix) {
    let nTestSets = Math.floor(Math.random() * 10);
    let aTestData = [];
    for (let i = 0; i < nTestSets; i++) {
        aTestData.push(randomTestObject(i));
    }
    let str = convertJSObjectToCSV(aTestData);
    DEBUG.log(`GENERATED CSV TEST DATA: ${str}`);
    return new URL(`${cURLPrefix}?csv=${encodeURIComponent(str)}`);
}

export function testInvalidEntries(cURLPrefix) {
    let aTestData = [];

    // Missing Key
    let oTest = randomTestObject("Missing LL Key");
    delete oTest.mover;
    aTestData.push(oTest);

    // Invalid type
    oTest = randomTestObject("Invalid LL Type");
    oTest.doer = "dingdingding";
    aTestData.push(oTest);

    // Out of range score
    oTest = randomTestObject("LL Score Out of Range");
    oTest.influencer = 300;
    aTestData.push(oTest);
    
    // Missing Key
    oTest = randomTestObject("Missing CI Key");
    delete oTest.acceptanceLevel;
    aTestData.push(oTest);

    // Invalid type
    oTest = randomTestObject("Invalid CI Type");
    oTest.internalControl = "dingdingding";
    aTestData.push(oTest);

    // Out of range score
    oTest = randomTestObject("CI Score Out of Range");
    oTest.intrusionLevel = 300;
    aTestData.push(oTest);
    
    // Bad interactive style
    oTest = randomTestObject("Bad Interactive Style Type");
    oTest.interactiveStyle = '35.0Q';
    aTestData.push(oTest);
    
    // Missing interactive style
    oTest = randomTestObject("Missing Interactive Style Type");
    oTest.interactiveStyle = '35.0';
    aTestData.push(oTest);   

    // Missing interactive style
    oTest = randomTestObject("Invalid Interactive Style Score");
    oTest.interactiveStyle = 'abc';
    aTestData.push(oTest);   
    
    // Missing interactive style score (decomposed)
    oTest = randomTestObject("Missing Interactive Style Score  (decomposed)");
    delete oTest.interactiveStyle;
    oTest.interactiveStyleType = 'B';
    aTestData.push(oTest);   

     // Missing interactive style type (decomposed)
    oTest = randomTestObject("Missing Interactive Style Type  (decomposed)");
    delete oTest.interactiveStyle;
    oTest.interactiveStyleScore = 35.5;
    aTestData.push(oTest);  
    
    // Bad interactive style score (decomposed)
    oTest = randomTestObject("Bad Interactive Style Score  (decomposed)");
    delete oTest.interactiveStyle;
    oTest.interactiveStyleScore = 'abc';
    oTest.interactiveStyleType = 'B';
    aTestData.push(oTest);
    
    
    // Bad interactive style type (decomposed)
    oTest = randomTestObject("Bad Interactive Style Score  (decomposed)");
    delete oTest.interactiveStyle;
    oTest.interactiveStyleScore = 35.5;
    oTest.interactiveStyleType = 'X';
    aTestData.push(oTest); 
  
    
    let str = JSON.stringify(aTestData);
    DEBUG.log(`GENERATED INVALID JSON DATA: ${str}`);
    return new URL(`${cURLPrefix}?json=${encodeURIComponent(str)}`);
}