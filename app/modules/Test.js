/**
 * Module for testing and generating test data.
 * @author Carl Orthlieb
 * @namespace TEST
 */

import { DEBUG } from "./Debug.js";

// List of common first names and last names
const firstNames = [
    "Doris",
    "Margaret",
    "Carolyn",
    "Alison",
    "James",
    "John",
    "Robert",
    "Michael",
    "William",
    "David",
    "Joseph",
    "Charles",
    "Thomas",
    "Daniel",
    "George",
    "Paul",
    "Ringo",
    "Chris"
];
const lastNames = [
    "Rosenberg",
    "Chin",
    "Au Yeung",
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
    "Martinez",
    "Bond",
    "McCartney",
    "Kincaid",
    "Trewlawney",
    "Hogan", 
    "Santos"
];
const companyNames = [
    "Percepta",
    "Exela Movers",
    "Ibotta, Inc.",
    "Wanderu Corporation",
    "Aceable, Inc.",
    "Intrepid Travel",
    "Defendify",
    "Twisters Gymnastics Academy",
    "Aims Community College",
    "Kaboom Fireworks",
    "Compass Mortgage",
    "Marathon Physical Therapy",
    "Semicolon Bookstore",
    "Northstar Consulting"
];

export const TEST = {
    /**
     * Generates a random score.
     * @returns {number} from 1 to 99.
     */
    randomScore: () => {
        return TEST.randomInt(1, 99);
    },

    /**
     * Generates a random interactive style type. Either Internal (I), Balanced (B), or External (E).
     * @returns {string} Character indicating the interactive style.
     */
    randomInteractiveStyle: () => {
        let interactiveStyleTypeArray = ["I", "B", "E"];
        return interactiveStyleTypeArray[Math.floor(Math.random() * 3)];
    },

    /**
     * Generates a random boolean.
     * @returns {boolean} The generated random boolean.
     */
    randomBool: () => {
        return Math.random() < 0.5;
    },
    
    /**
     * Generates a random number.
     * @param {number} min The minimum of the random number range (inclusive).
     * @param {number} max The maximum of the random number range (inclusive)
     * @returns {number} The generated random number.
     */
    randomNumber: (min, max) => {
        return Math.random() * (max - min + 1) + min;
    },

     /**
     * Generates a integer.
     * @param {number} min The minimum of the random number range (inclusive).
     * @param {number} max The maximum of the random number range (inclusive)
     * @returns {number} The generated random integer.
     */
    randomInt: (min, max) => {
        return Math.floor(TEST.randomNumber(min, max));
    },

    /**
     * Generates a random first name last name pair.
     * @returns {string} The generated name.
     */
    generateRandomNamePair: () => {
        const firstNameIndex = TEST.randomInt(0, firstNames.length - 1);
        const lastNameIndex = TEST.randomInt(0, lastNames.length - 1);
        return firstNames[firstNameIndex] + " " + lastNames[lastNameIndex];
    },

    /**
     * Generates a random company name.
     * @returns {string} The generated name.
     */
    generateRandomCompanyName: () => {
        return companyNames[TEST.randomInt(0, companyNames.length - 1)];
    },
    
    /**
     * Generates a random learning preference set. The set scores will all add up to 100.
     * @returns {object} Object containing random scores for learningPreferenceAuditory, learningPreferenceVisual, and learningPreferencePhysical.
     */
    generateRandomLearningPreference: () => {
        let nAuditory = TEST.randomInt(1, 98);
        let nVisual = TEST.randomInt(1, 99 - nAuditory);
        let nPhysical = 100 - nAuditory - nVisual;
        
        return { learningPreferenceAuditory: nAuditory, learningPreferenceVisual: nVisual,  learningPreferencePhysical: nPhysical };
    },
    
    /**
     * Generates a random person object. This is just the data, not a person class instantiation.
     * @param {string} [fullName] Optional full name to be used for the person.
     * @returns {object} Object containing random scores for learningPreferenceAuditory, learningPreferenceVisual, and learningPreferencePhysical.
     */
    randomPerson(fullName = null) {
        let person = {
            fullName: fullName ? fullName : TEST.generateRandomNamePair(),
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
            interactiveStyleScore: TEST.randomScore(),
            interactiveStyleType: TEST.randomInteractiveStyle(),
            internalControl: TEST.randomScore(),
            intrusionLevel: TEST.randomScore(),
            projectiveLevel: TEST.randomScore(),
            susceptibilityToStress: TEST.randomScore(),
            showForensics: TEST.randomBool()
        };
        
        let lp = TEST.generateRandomLearningPreference();
        Object.keys(lp).forEach(key => person[key] = lp[key]);
        
        return person;
    },
    
    /**
     * Generates an array of random people.
     * @param {number} nTestSets Number of people to generate.
     * @returns {array} Array containing the people.
     */
    randomPeople(nTestSets) {
        let aTestData = [];
        let uniqueNames = new Set();

        for (let i = 0; i < nTestSets; i++) {
            let testObject;

            // Ensure the generated name is unique
            do {
                testObject = TEST.randomPerson();
            } while (uniqueNames.has(testObject.fullName)); // Repeat if duplicate name is found

            // Add unique name to the Set and push the object to the array
            uniqueNames.add(testObject.fullName);
            aTestData.push(testObject);
        }
        return aTestData;
    }
};