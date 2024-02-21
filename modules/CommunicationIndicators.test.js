// Generate test data for Communication Indicators

import { convertJSObjectToCSV } from "./CSVToJSON.js";

function randomScore() {
    return Math.floor(Math.random() * 100);
}

function randomInteractiveStyle() {
    let interactiveStyleTypeArray = ["I", "B", "E"];
    return interactiveStyleTypeArray[Math.floor(Math.random() * 3)];
}

function randomBool() {
    return Math.random() < 0.5;
}

function randomTestObject(cSuffix = "") {
    return {
        fullName: `Full Name ${cSuffix}`,
        companyName: `Company Name ${cSuffix}`,
        mover: randomScore(),
        doer: randomScore(),
        influencer: randomScore(),
        responder: randomScore(),
        shaper: randomScore(),
        producer: randomScore(),
        contemplator: randomScore(),
        overallIntensity: randomScore(),
        acceptanceLevel: randomScore(),
        interactiveStyle: randomScore() + randomInteractiveStyle(),
        internalControl: randomScore(),
        intrusionLevel: randomScore(),
        projectiveLevel: randomScore(),
        susceptibilityToStress: randomScore(),
        learningPreferenceVisual: randomScore(),
        learningPreferenceAuditory: randomScore(),
        learningPreferencePhysical: randomScore(),
        showForensics: randomBool()
    };
}

export function testSingle(cURLPrefix) {
    let oTest = randomTestObject("Single");

    console.log(`GENERATED TEST DATA: ${JSON.stringify(oTest)}`);
    const cParams = Object.keys(oTest)
        .map(
            (key) =>
                `${encodeURIComponent(key)}=${encodeURIComponent(oTest[key])}`
        )
        .join("&");

    return new URL(`${cURLPrefix}?${cParams}`);
}

export function testJSON(cURLPrefix) {
    let nTestSets = Math.floor(Math.random() * 10);
    let aTestData = [];
    for (let i = 0; i < nTestSets; i++) {
        aTestData.push(randomTestObject(i));
    }
    let str = JSON.stringify(aTestData);
    console.log(`GENERATED TEST DATA: ${str}`);
    return new URL(`${cURLPrefix}?json=${encodeURIComponent(str)}`);
}

export function testCSV(cURLPrefix) {
    let nTestSets = Math.floor(Math.random() * 10);
    let aTestData = [];
    for (let i = 0; i < nTestSets; i++) {
        aTestData.push(randomTestObject(i));
    }
    let str = convertJSObjectToCSV(aTestData);
    console.log(`GENERATED CSV TEST DATA: ${str}`);
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
    console.log(`GENERATED INVALID JSON DATA: ${str}`);
    return new URL(`${cURLPrefix}?json=${encodeURIComponent(str)}`);
}