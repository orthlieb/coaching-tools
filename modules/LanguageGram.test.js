// Generate test data for LanguageGram
import { convertJSObjectToCSV } from "./CSVToJSON.js";

function randomScore() {
    return Math.floor(Math.random() * 100);
}

function randomTestObject(cSuffix='') {
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
        overallIntensity: randomScore()
     };
}

export function testSingle(cURLPrefix) {
    let oTest = randomTestObject('Single');
    
    console.log(`GENERATED TEST DATA: ${JSON.stringify(oTest)}`);
    const cParams = Object.keys(oTest)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(oTest[key])}`)
        .join('&');

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

export function testInvalidJSON(cURLPrefix) {
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
    console.log(`GENERATED INVALID JSON DATA: ${str}`);
    return new URL(`${cURLPrefix}?json=${encodeURIComponent(str)}`); 
}