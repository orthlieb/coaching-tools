// Generate test data for Communication Indicators

import { ERROR } from "../Error.js";
import { DEBUG } from "../Debug.js";
import { TEST } from '../Test.js';

import { CSV } from "../CSVToJSON.js";

export function testSingle(cURLPrefix) {
    let oTest = TEST.randomPerson("Single");

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
    let aTestData = TEST.randomPeople(TEST.randomInt(4, 8));
    let str = JSON.stringify(aTestData);
    DEBUG.log(`GENERATED TEST DATA: ${str}`);
    return new URL(`${cURLPrefix}?json=${encodeURIComponent(str)}`);
}

export function testCSV(cURLPrefix) {
    let aTestData = TEST.randomPeople(TEST.randomInt(4, 8));
    let str = CSV.fromJSObject(aTestData);
    DEBUG.log(`GENERATED CSV TEST DATA: ${str}`);
    return new URL(`${cURLPrefix}?csv=${encodeURIComponent(str)}`);
}

export function testInvalidEntries(cURLPrefix) {
    let aTestData = [];

    // Missing Key
    let oTest = TEST.randomPerson("Missing LL Key");
    delete oTest.mover;
    aTestData.push(oTest);

    // Invalid type
    oTest = TEST.randomPerson("Invalid LL Type");
    oTest.doer = "dingdingding";
    aTestData.push(oTest);

    // Out of range score
    oTest = TEST.randomPerson("LL Score Out of Range");
    oTest.influencer = 300;
    aTestData.push(oTest);
    
    // Missing Key
    oTest = TEST.randomPerson("Missing CI Key");
    delete oTest.acceptanceLevel;
    aTestData.push(oTest);

    // Invalid type
    oTest = TEST.randomPerson("Invalid CI Type");
    oTest.internalControl = "dingdingding";
    aTestData.push(oTest);

    // Out of range score
    oTest = TEST.randomPerson("CI Score Out of Range");
    oTest.intrusionLevel = 300;
    aTestData.push(oTest);
    
    // Bad interactive style
    oTest = TEST.randomPerson("Bad Interactive Style Type");
    delete oTest.interactiveStyleType;
    delete oTest.interactiveStyleScore;
    oTest.interactiveStyle = '35.0Q';
    aTestData.push(oTest);
    
    // Missing interactive style
    oTest = TEST.randomPerson("Missing Interactive Style Type");
    delete oTest.interactiveStyleType;
    delete oTest.interactiveStyleScore;
    oTest.interactiveStyle = '35.0';
    aTestData.push(oTest);   

    // Missing interactive style
    oTest = TEST.randomPerson("Invalid Interactive Style Score");
    delete oTest.interactiveStyleType;
    delete oTest.interactiveStyleScore;
    oTest.interactiveStyle = 'Q';
    aTestData.push(oTest);   
    
    // Missing interactive style score (decomposed)
    oTest = TEST.randomPerson("Missing Interactive Style Score (decomposed)");
    delete oTest.interactiveStyle;
    delete oTest.interactiveStyleScore;
    aTestData.push(oTest);   

     // Missing interactive style type (decomposed)
    oTest = TEST.randomPerson("Missing Interactive Style Type (decomposed)");
    delete oTest.interactiveStyle;
    delete oTest.interactiveStyleType;
    aTestData.push(oTest);  
    
    // Bad interactive style score (decomposed)
    oTest = TEST.randomPerson("Bad Interactive Style Score (decomposed)");
    delete oTest.interactiveStyle;
    oTest.interactiveStyleScore = 'biss';
     aTestData.push(oTest);
        
    // Bad interactive style type (decomposed)
    oTest = TEST.randomPerson("Bad Interactive Style Type (decomposed)");
    delete oTest.interactiveStyle;
    oTest.interactiveStyleType = 'ABC';
    aTestData.push(oTest); 
  
    // Bad interactive style type (decomposed)
    oTest = TEST.randomPerson("Invalid Interactive Style Type (decomposed)");
    delete oTest.interactiveStyle;
    oTest.interactiveStyleType = 'Q';
    aTestData.push(oTest); 
    
    let str = JSON.stringify(aTestData);
    DEBUG.log(`GENERATED INVALID JSON DATA: ${str}`);
    return new URL(`${cURLPrefix}?json=${encodeURIComponent(str)}`);
}