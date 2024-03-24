import { ASSERT, ASSERT_TYPE, ASSERT_RANGE } from './Error.js';
import { LLKEYS, LLCOLORS, LLCOLORS_LIGHT } from './Common.js';

/**
 * Sort people according to the specified sortKey.
 * @example
 * let people = [ { fullName: "Bob Dingle", mover: 34, doer: 12}, { fullName: "Alice Dongle", mover: 23, doer: 56 } ];
 * let sortedPeople = sortPeople(people, 'fullName', 'mover');
 * console.log(JSON.stringify(sortedPeople));
 * // Outputs { fullName: ["Alice Dongle", "Bob Dingle"], mover: [23, 34]};
 * sortedPeople = sortPeople(people, 'mover', ['mover', 'doer'], false);
 * console.log(JSON.stringify(sortedPeople));
 * // Outputs { fullName: ["Bob Dingle", "Alice Dongle"], mover: [34, 23], doer: [12, 56] 
 * @param {object[]} people Array of people objects. Each person object has at least fullName and any other shared properties.
 * @param {string} [sortKey='fullName'] Property in the person object to sort by. Must be a string, number, or boolean.
 * @param {string[]} [dataKeys=['fullName']] Array of property names to extract from the people after they are sorted.
 * @param {boolean} [bAscending=true] Sort ascending or descending.
 * @returns {object} An object where each specified dataKey is an array of values for the people. fullName is always included.
 */
function sortPeople(people, sortKey = 'fullName', dataKeys = [ 'fullName' ], bAscending = true) {
    dataKeys = Array.isArray(dataKeys) ? dataKeys : [dataKeys];
    let type = typeof people[0][sortKey];
    
    ASSERT(type == 'number' || type == 'string' || type == 'boolean', `sortPeople parameter ${sortKey}, expected type number, string, or boolean, found ${type} ${people[0][sortKey]}`);

    // Sort the data based on score in descending order
    people.sort((a, b) => {           
        if (a[sortKey] < b[sortKey]) return bAscending ? -1 : 1;
        if (a[sortKey] > b[sortKey]) return bAscending ? 1 : -1;
        return 0; 
    });

    // Extract the data.
    let sortedData = { fullName: people.map(person => { return person.fullName; } ) }; // Always do fullName first.
    for (let dataKey of dataKeys) {
        if (dataKey in people[0] && dataKey != 'fullName')
            sortedData[dataKey] = people.map(person => { return person[dataKey]; } );
    }
     
}
    
    
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
    
    // Table Header
    let rgTable = rgElement.querySelector(".score-header");
    let cBack = key + '-background';
    rgTable.innerHTML = `<tr><th class="${cBack}">Name</th>
        <th class="${cBack}">Overall Intensity</th>
        <th class="${cBack} capitalize">${key}</th></tr>`;
     
    // Table Body
    let aSortedByScoresDescending = sortPeople(data, key, [ key, 'overallIntensity' ], false);
    rgTable = rgElement.querySelector('.score-body');
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
            cClass += key + '-border-top '; 
            bFluent = true;
        }
        
        // Shade even rows
        if ( (i + 1) % 2 == 0)
            cClass += key + '-light-background ';
        
        cTableBody += 
            `<tr>
                <td class="${cClass}">${cPerson}</td>
                <td class="${cClass}">${nOverallIntensity}</td>
                <td class="${cClass}">${nScore} 
                    <span class="arrow">${evaluateScoreArrow(nScore)}</span
                </td>
            </tr>`;
        
    }
    rgTable.innerHTML = cTableBody;

    // Table Footer
    rgTable = rgElement.querySelector('.score-footer');

    let nAverageOverallIntensity = Math.round(aSortedByScoresDescending.overallIntensity.reduce((acc, curr) => acc + curr, 0) / aSortedByScoresDescending.overallIntensity.length);
    let nAverageScore = Math.round(aSortedByScoresDescending[key].reduce((acc, curr) => acc + curr, 0) / aSortedByScoresDescending[key].length);
    
    rgTable.innerHTML = 
        `<tr>
            <td class="${cBack}">Group Average</td>
            <td  class="${cBack}">${nAverageOverallIntensity}</td>
            <td  class="${cBack}">${nAverageScore} ${evaluateScoreArrow(nAverageScore)}</td>
        </tr>`;
    rgTable.style.backgroundColor = LLCOLORS[key];

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
           maintainAspectRatio: false,
           elements: {
               line: {
                   borderWidth: 1
               }
           },
           plugins: { legend: false },
           scale: {
               ticks: {
                   min: 0,
                   max: 100,
                   stepSize: 10
               }
           }
       }
    };    
    new Chart(rgElement.querySelector('.radarGraph'), config);
    
    // Handle printing events.
    window.addEventListener("beforeprint", (event) => {
        let collection = ciElement.getElementsByClassName("radarGraph");
        for (let i = 0; i < collection.length; i++) {
            const chart = collection.item(i);
            // 1101 is a complete hack for Letter size paper portrait orientation.
            Chart.getChart(chart).resize(1101 / 3, 75);
        }
     });

    window.addEventListener("afterprint", (event) => {
        for (let id in Chart.instances) {
            let chart = Chart.instances[id];
            chart.resize();
        }
    });

}
