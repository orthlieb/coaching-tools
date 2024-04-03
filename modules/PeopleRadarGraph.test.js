// Generate test data for LifeLanguageRadarGraph
import { convertJSObjectToCSV } from "./CSVToJSON.js";

function randomScore() {
    return Math.floor(Math.random() * 100);
}

// List of common first names and last names
const firstNames = ["Doris", "Margaret", "Carolyn", "Alison", "James", "John", "Robert", "Michael", "William", "David", "Joseph", "Charles", "Thomas", "Daniel", "George", "Paul", "Ringo"];
const lastNames = ["Rosenberg", "Chin", "Au Yeung", "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Bond", "McCartney", "Kincaid", "Trewlawney"];

// Function to generate a random integer between min and max (inclusive)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to generate a random first name-last name pair
function generateRandomNamePair() {
    const firstNameIndex = getRandomInt(0, firstNames.length - 1);
    const lastNameIndex = getRandomInt(0, lastNames.length - 1);
    return firstNames[firstNameIndex] + ' ' + lastNames[lastNameIndex];
}


function randomTestObject() {
    return {
        fullName: generateRandomNamePair(),
        companyName: 'Relationship Matters',
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

export function testJSON(cURLPrefix) {
    let nTestSets =Math.random() * 10 + 5;
    let aTestData = [];
    for (let i = 0; i < nTestSets; i++) {
        aTestData.push(randomTestObject(i));
    }
     let str = JSON.stringify(aTestData);
    console.log(`GENERATED TEST DATA: ${str}`);
    return new URL(`${cURLPrefix}?json=${encodeURIComponent(str)}`);
}

export function testCSV(cURLPrefix) {
    let nTestSets = Math.random() * 3 + 2;
    let aTestData = [];
    for (let i = 0; i < nTestSets; i++) {
        aTestData.push(randomTestObject());
    }
     let str = convertJSObjectToCSV(aTestData);
    console.log(`GENERATED CSV TEST DATA: ${str}`);
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
    console.log(`GENERATED INVALID JSON DATA: ${str}`);
    return new URL(`${cURLPrefix}?json=${encodeURIComponent(str)}`);
}