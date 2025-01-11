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

    let oTest = TEST.randomPerson("Missing name");
    delete oTest.fullName;
    aTestData.push(oTest);

    oTest = TEST.randomPerson("Missing LL Key");
    delete oTest.mover;
    aTestData.push(oTest);

    oTest = TEST.randomPerson("Invalid LL Type");
    oTest.doer = "dingdingding";
    aTestData.push(oTest);

    oTest = TEST.randomPerson("LL Score Out of Range");
    oTest.influencer = 300;
    aTestData.push(oTest);
    
    oTest = TEST.randomPerson("Missing CI Key");
    delete oTest.acceptanceLevel;
    aTestData.push(oTest);

    oTest = TEST.randomPerson("Invalid CI Type");
    oTest.internalControl = "dingdingding";
    aTestData.push(oTest);

    oTest = TEST.randomPerson("CI Score Out of Range");
    oTest.intrusionLevel = 300;
    aTestData.push(oTest);
    
    // Combined
    
    oTest = TEST.randomPerson("Missing Interactive Style Type (combined)");
    delete oTest.interactiveStyleType;
    delete oTest.interactiveStyleScore;
    oTest.interactiveStyle = '35.0';
    aTestData.push(oTest);   

    oTest = TEST.randomPerson("Invalid Interactive Style Type (combined)");
    delete oTest.interactiveStyleType;
    delete oTest.interactiveStyleScore;
    oTest.interactiveStyle = '35.0Q';
    aTestData.push(oTest);
    
    oTest = TEST.randomPerson("Missing Interactive Style Score (combined)");
    delete oTest.interactiveStyleType;
    delete oTest.interactiveStyleScore;
    oTest.interactiveStyle = 'I';
    aTestData.push(oTest);   
    
    oTest = TEST.randomPerson("Invalid Interactive Style Score (combined)");
    delete oTest.interactiveStyleType;
    delete oTest.interactiveStyleScore;
    oTest.interactiveStyle = 'ABCI';
    aTestData.push(oTest);   
    
    oTest = TEST.randomPerson("Out of Range Interactive Style Score (combined)");
    delete oTest.interactiveStyleType;
    delete oTest.interactiveStyleScore;
    oTest.interactiveStyle = '125I';
    aTestData.push(oTest);   

    // Separate
    
    oTest = TEST.randomPerson("Missing Interactive Style Type (separate)");
    delete oTest.interactiveStyle;
    delete oTest.interactiveStyleType;
    oTest.interactiveStyleScore = 35.0;
    aTestData.push(oTest);  

    oTest = TEST.randomPerson("Invalid Interactive Style Type (separate)");
    delete oTest.interactiveStyle;
    oTest.interactiveStyleScore = 35.0;
    oTest.interactiveStyleType = 'Q';
    aTestData.push(oTest);

    oTest = TEST.randomPerson("Missing Interactive Style Score (separate)");
    delete oTest.interactiveStyle;
    delete oTest.interactiveStyleScore;
    oTest.interactiveStyleType = 'I';
    aTestData.push(oTest);   

    oTest = TEST.randomPerson("Invalid Interactive Style Score");
    delete oTest.interactiveStyle;
    oTest.interactiveStyleScore = 'ABC';
    oTest.interactiveStyleType = 'I';
    aTestData.push(oTest);
        
    oTest = TEST.randomPerson("Out of Range Interactive Style Score");
    delete oTest.interactiveStyle;
    oTest.interactiveStyleScore = 135.0;
    oTest.interactiveStyleType = 'I';
    aTestData.push(oTest);
        
    // Normalized

    oTest = TEST.randomPerson("Out of Range Interactive Style");
    delete oTest.interactiveStyleType;
    delete oTest.interactiveStyleScore;
    oTest.interactiveStyle = 335.0;
    aTestData.push(oTest);
    
    let str = JSON.stringify(aTestData);
    DEBUG.log(`GENERATED INVALID JSON DATA: ${str}`);
    return new URL(`${cURLPrefix}?json=${encodeURIComponent(str)}`);
}