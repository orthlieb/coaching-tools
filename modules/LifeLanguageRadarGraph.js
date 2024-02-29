import { ASSERT, ASSERT_TYPE, ASSERT_RANGE } from './Error.js';
import { LLKEYS, LLCOLORS } from './Common.js';

function sortScores(people, sortKey, dataKeys, bAscending = true) {
    console.log('Sorting by ', sortKey);
    dataKeys = Array.isArray(dataKeys) ? dataKeys : [dataKeys];
    let type = typeof people[0][sortKey];
    
    ASSERT(type == 'number' || type == 'string' || type == 'boolean', `sortPeople parameter ${sortKey}, expected type number, string, or boolean, found ${type} ${people[0][sortKey]}`);

    // Sort the data based on score in descending order
    people.sort((a, b) => {           
        if (a[sortKey] < b[sortKey]) return bAscending ? -1 : 1;
        if (a[sortKey] > b[sortKey]) return bAscending ? 1 : -1;
        return 0; 
    });

    let sortedData = { fullName: people.map(person => person.fullName) }; // Always do fullName first.
    for (let dataKey of dataKeys) {
        console.log('dataKey', dataKey, dataKey in people[0]);
        if (dataKey in people[0] && dataKey != 'fullName')
            sortedData[dataKey] = people.map(person => person[dataKey]);
    }
    
    console.log('Sorted Data', JSON.stringify(sortedData));
    
    return sortedData;
}

/**
 * Validate incoming person.
 * @param {object} person Person data to be validated.
 * Will throw if there is invalid data.
 */
function validatePerson(person) {
    ASSERT('fullName' in person, 'validatePerson missing parameter person.fullName');
    ASSERT_TYPE(person.fullName, 'string', `validatePerson "${person.fullName}" parameter person.fullName`);
    
    ASSERT('overallIntensity' in person, 'validatePerson missing parameter person.overallIntensity');
    ASSERT_TYPE(person.overallIntensity, 'number', `validatePerson "${person.fullName}" parameter person.overallIntensity`);
    
    ASSERT_TYPE(person.companyName, 'string', `validatePerson "${person.companyName}" parameter person.fullName`);
    
    for (let cKey of LLKEYS) {
        ASSERT(cKey in person, `validatePerson "${person.fullName}" missing parameter person.${cKey}`);
        ASSERT_TYPE(person[cKey], 'number', `validatePerson "${person.fullName}" parameter person.${cKey}`);
        ASSERT_RANGE(person[cKey], 0, 100, `validatePerson "${person.fullName}" parameter person.${cKey}`);
    }
}

function validateData(data) {
    for (let i = 0; i < data.length; i++) {
        validatePerson(data[i]);
    }
}

/**
 * Evaluates whether Score is VERY LOW, LOW, MODERATE, HIGH or VERY HIGHT.
 * @param {number} nValue The value to be evaluated.
 * @returns {string} Returns the arrow corresponding the score.
 */
function evaluateScoreArrow(nValue) {
    if (nValue < 15) return '&#x1F87B;';         // down
    else if (nValue < 35) return '&#x1F87E;';    // down-right
    else if (nValue < 65) return '&#x1F87A;';    // right
    else if (nValue < 85) return '&#x1F87D;';    // up-right
    return '&#x1F879;';                          // up
}


function solidToTransparentColor(color, alpha) {
    // Parse the color string to extract RGB components
    const match = color.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (!match) {
        throw new Error(`Invalid color format ${color}`);
    }

    // Convert hexadecimal to decimal
    const r = parseInt(match[1], 16);
    const g = parseInt(match[2], 16);
    const b = parseInt(match[3], 16);

    // Return RGBA color string with specified alpha channel
    return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * Main function to draw the Radar Graph.
 * @param {string} cSuffix Suffix to add find the appropriate parent div.
 * @param {array} people An array containing people objects with their name and Life Language scores.
 * @param {string} key Life Language Key to display.
 */
export function displayRadarGraph(cSuffix, data, key) {
    validateData(data);

    let rgElement = document.getElementById('radar-graph-' + cSuffix);

    let rgTitle = rgElement.querySelector('.title');
    let cTitle = key.charAt(0).toUpperCase() + key.slice(1);
    rgTitle.innerText = `Group Radar Graph for the ${cTitle} Life Language\u2122`;
    
    let rgCompanyName = rgElement.querySelector('.companyname');
    rgCompanyName.innerText = data[0].companyName;
     
    // Table
    let aSortedByScoresDescending = sortScores(data, key, [ key, 'overallIntensity' ], false);
    let rgTable = rgElement.querySelector('.table-body');
    let cTableBody = '';
    let nPeople = aSortedByScoresDescending.fullName.length;
    let bFluent = false;
    for (let i = 0; i < nPeople; i++) {
        let cPerson = aSortedByScoresDescending.fullName[i];
        let nScore = Math.round(aSortedByScoresDescending[key][i]);
        let nOverallIntensity = Math.round(aSortedByScoresDescending.overallIntensity[i]);
        
        // Fluency dividing line.
        let cClass = '';
        if (nScore < 50 && !bFluent) {
            cClass = 'fluent';
            bFluent = true;
        }
        
        cTableBody += `<tr class="${cClass}"><td>${cPerson}</td><td>${nOverallIntensity}<td>${nScore} <span class="arrow">${evaluateScoreArrow(nScore)}</span></td></tr>`;
        
    }
    rgTable.innerHTML = cTableBody;

    // Table footer
    let rgFoot = rgElement.querySelector('.table-foot');

    let nAverageOverallIntensity = Math.round(aSortedByScoresDescending.overallIntensity.reduce((acc, curr) => acc + curr, 0) / aSortedByScoresDescending.overallIntensity.length);
    
    let nAverageScore = Math.round(aSortedByScoresDescending[key].reduce((acc, curr) => acc + curr, 0) / aSortedByScoresDescending[key].length);
    
    rgFoot.innerHTML = `<tr class="fluent"><td>Group Average</td><td class="align-right">${nAverageOverallIntensity}</td><td class="align-right">${nAverageScore} <span class="arrow">${evaluateScoreArrow(nAverageScore)}</span></td><tr>`;

    // Radar graph
    let aSortedByPeopleAscending = sortScores(data, 'fullName', key, true);
    const chartData = {
        labels: aSortedByPeopleAscending.fullName,
        datasets: [
            {
                label: `${cTitle} Life Language`,
                data: aSortedByPeopleAscending[key],
                fill: true,
                backgroundColor: solidToTransparentColor(LLCOLORS[key], 0.2),
                borderColor: LLCOLORS[key],
                pointBackgroundColor: LLCOLORS[key],
                pointBorderColor: "#fff",
                pointHoverBackgroundColor: "#fff",
                pointHoverBorderColor: LLCOLORS[key]
            }
        ]
    };   
    
    const config = {
        type: "radar",
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            elements: {
                line: {
                    borderWidth: 1
                }
            },
            plugins: { legend: false }
        }
    };
    
    new Chart(rgElement.querySelector('.radarGraph'), config);
}
