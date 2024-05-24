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
    "Ringo"
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
    "Trewlawney"
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
    "Semicolon Bookstore"
];

export const TEST = {
    randomScore: () => {
        return TEST.randomInt(1, 99);
    },

    randomInteractiveStyle: () => {
        let interactiveStyleTypeArray = ["I", "B", "E"];
        return interactiveStyleTypeArray[Math.floor(Math.random() * 3)];
    },

    randomBool: () => {
        return Math.random() < 0.5;
    },
    
    randomNumber: (min, max) => {
        return Math.random() * (max - min + 1) + min;
    },

    // Function to generate a random integer between min and max (inclusive)
    randomInt: (min, max) => {
        return Math.floor(TEST.randomNumber(min, max));
    },

    // Function to generate a random first name-last name pair
    generateRandomNamePair: () => {
        const firstNameIndex = TEST.randomInt(0, firstNames.length - 1);
        const lastNameIndex = TEST.randomInt(0, lastNames.length - 1);
        return firstNames[firstNameIndex] + " " + lastNames[lastNameIndex];
    },

    // Function to generate a random first name-last name pair
    generateRandomCompanyName: () => {
        return companyNames[TEST.randomInt(0, companyNames.length - 1)];
    }
};