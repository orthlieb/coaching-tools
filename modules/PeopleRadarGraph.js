import { appendAlert, ASSERT, ASSERT_TYPE, ASSERT_RANGE } from "./Error.js";
import { LLKEYS, LLCOLORS, LLCOLORS_LIGHT } from "./Common.js";

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
function sortScores(people, sortKey, dataKeys, bAscending = true) {
    dataKeys = Array.isArray(dataKeys) ? dataKeys : [dataKeys];
    let type = typeof people[0][sortKey];

    ASSERT(
        type == "number" || type == "string" || type == "boolean",
        `sortPeople parameter ${sortKey}, expected type number, string, or boolean, found ${type} ${people[0][sortKey]}`
    );

    // Sort the data based on score in descending order
    people.sort((a, b) => {
        if (a[sortKey] < b[sortKey]) return bAscending ? -1 : 1;
        if (a[sortKey] > b[sortKey]) return bAscending ? 1 : -1;
        return 0;
    });

    let sortedData = {
        fullName: people.map((person) => {
            return person.fullName;
        })
    }; // Always do fullName first.
    for (let dataKey of dataKeys) {
        if (dataKey in people[0] && dataKey != "fullName")
            sortedData[dataKey] = people.map((person) => {
                return person[dataKey];
            });
    }

    return sortedData;
}

/**
 * Validate incoming person object.
 * @param {object} person Person data to be validated.
 * Will throw if there is invalid data.
 */
function validatePerson(person) {
    ASSERT(
        "fullName" in person,
        "validatePerson missing parameter person.fullName"
    );
    ASSERT_TYPE(
        person.fullName,
        "string",
        `validatePerson "${person.fullName}" parameter person.fullName`
    );

    ASSERT(
        "overallIntensity" in person,
        "validatePerson missing parameter person.overallIntensity"
    );
    ASSERT_TYPE(
        person.overallIntensity,
        "number",
        `validatePerson "${person.fullName}" parameter person.overallIntensity`
    );

    ASSERT_TYPE(
        person.companyName,
        "string",
        `validatePerson "${person.companyName}" parameter person.companyName`
    );

    for (let cKey of LLKEYS) {
        ASSERT(
            cKey in person,
            `validatePerson "${person.fullName}" missing parameter person.${cKey}`
        );
        ASSERT_TYPE(
            person[cKey],
            "number",
            `validatePerson "${person.fullName}" parameter person.${cKey}`
        );
        ASSERT_RANGE(
            person[cKey],
            0,
            100,
            `validatePerson "${person.fullName}" parameter person.${cKey}`
        );
    }
}

/**
 * Validate the data passed into us.
 * @param {array} data Array of people objects containing Life Language info.
 * Will throw if there is invalid data.
 */
function validateData(data) {
    ASSERT(data.length > 2, `validateData not enough people for generating radar graph, must be > 2, found ${data.length}`);
    for (let i = 0; i < data.length; i++) {
        try {
            validatePerson(data[i]);
        } catch (e) {
            console.log(e);
            appendAlert(e, 'error');
        }
    }
}

/**
 * Evaluates whether Score is VERY LOW, LOW, MODERATE, HIGH or VERY HIGHT.
 * @param {number} nValue The value to be evaluated.
 * @returns {string} Returns the arrow corresponding the score.
 */
function evaluateScoreArrow(nValue) {
    if (nValue < 15) return "&#x1F87B;"; // down
    else if (nValue < 35) return "&#x1F87E;"; // down-right
    else if (nValue < 65) return "&#x1F87A;"; // right
    else if (nValue < 85) return "&#x1F87D;"; // up-right
    return "&#x1F879;"; // up
}

/**
 * Draw a radar graph where each element in the data set is the person and the axes are Life Languages.
 * @param {array} people Array of person objects.
 * @param {element} element Element to draw the graph into.
 * @returns {object} The created chart object.
 */
function drawRadarGraph(people, element) {
    let nPeople = people.fullName.length;
    
    // Radar graph
    const chartData = {
        labels: LLKEYS.map((key) => { return key.charAt(0).toUpperCase() + key.slice(1); }),
        datasets: []
    };
    
    for (let i = 0; i < nPeople; i++) {
       chartData.datasets.push({
            label: people.fullName[i],
            data: [ people.mover[i], people.doer[i], people.influencer[i], people.responder[i],
                   people.shaper[i], people.producer[i], people.contemplator[i] ],
            fill: true
        });
    }
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
            scales: {
                r: {
                    beginAtZero: true,
                    min: 0,
                    max: 100,
                    stepSize: 10
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                }
            }
        }
    };        
    let theChart = new Chart(element, config);

    //// Handle printing events.
    //window.addEventListener("beforeprint", (event) => {
    //    let collection = ciElement.getElementsByClassName("radar-graph");
    //    for (let i = 0; i < collection.length; i++) {
    //        const chart = collection.item(i);
    //        // 1101 is a complete hack for Letter size paper portrait orientation.
    //        Chart.getChart(chart).resize(1101 / 3, 75);
    //    }
    //});
//
    //window.addEventListener("afterprint", (event) => {
    //    for (let id in Chart.instances) {
    //        let chart = Chart.instances[id];
    //        chart.resize();
    //    }
    //});
    //
    return theChart;
}
/**
 * Main function to draw the Radar Graph and corresponding table.
 * @param {string} cSuffix Suffix to add find the appropriate parent div.
 * @param {array} people An array containing people objects with their name and Life Language scores.
 * @param {number} nPerson1 Person 1 to compare against.
 * @param {number} nPerson2 Person 2 to compare against.
 */
export function displayRadarGraphAndTable(cSuffix, data) {
    validateData(data);
    
    let aSortedByPeopleAscending = sortScores(data, 'fullName', [...LLKEYS, 'companyName']);
    let rgElement = document.getElementById("radar-graph-" + cSuffix);    
    let theChart = drawRadarGraph(aSortedByPeopleAscending, rgElement.querySelector(".radarGraph"));

    rgElement.querySelector(".companyname").innerText = aSortedByPeopleAscending.companyName[0];

    let cText = '<tr><th class="col-5">Name</th>';
    for (let key of LLKEYS) {
        cText += `<th class="col-1 vheader">
            <label class="form-check-label capitalize vertical" for="${key}-checkbox">${key}</label>
        </th>`;
    }
    cText += '</tr>';
    rgElement.querySelector(".score-header").innerHTML = cText;

    // Prepare for averages
    let averages = {};
    averages = LLKEYS.reduce((obj, key) => {
        obj[key] = 0;
        return obj;
    }, averages);
    let nPeople = aSortedByPeopleAscending.fullName.length;
    
    // Table Body
    cText = '';
    for (let i = 0; i < nPeople; i++) {
        cText += `<tr>
            <td class="col-1">
                <input type="checkbox" id="name-${i}" checked>
            </td>
            <td class="col-4">${aSortedByPeopleAscending.fullName[i]}</td>`;
        for (let key of LLKEYS) {
            let nScore = aSortedByPeopleAscending[key][i];
            cText += `<td class="col-1 text-end">${nScore}</td>`;
            averages[key] += nScore;
        }
        cText += "</tr>";
    }
    rgElement.querySelector(".score-body").innerHTML = cText;


    // Table Footer
    cText = '<tr><th class="col-5">Group Average</th>';
    for (let key of LLKEYS) {
        averages[key] /= nPeople;
        cText += `<td class="col-1 text-end">${Math.round(averages[key])}</td>`;
    }
    cText += '</tr>';
    rgElement.querySelector(".score-footer").innerHTML = cText;

    // Event listeners for checkboxes
    document.querySelectorAll('input[type="checkbox"][id^="name"]').forEach((element) => {
        element.addEventListener('change', (e) => {
             // Use match method to find the matched substring
            let match = e.srcElement.id.match(/name-(\d+)/);
            let id = parseInt(match[1]);
            theChart.data.datasets[id].hidden = !e.srcElement.checked;
            theChart.update();
        });
    });
    
    // Clear button for checkboxes
    document.getElementById('clearChecks').addEventListener('click', (e) => {
        document.querySelectorAll('input[type="checkbox"][id^="name"]').forEach((element) => {
            element.checked = false;
        });
        theChart.data.datasets.forEach((dataset) => {
            dataset.hidden = true;
        });
        theChart.update();
    });
    
    // Select button for checkboxes
    document.getElementById('selectChecks').addEventListener('click', (e) => {
        document.querySelectorAll('input[type="checkbox"][id^="name"]').forEach((element) => {
            element.checked = true;
        });
        theChart.data.datasets.forEach((dataset) => {
            dataset.hidden = false;
        });
        theChart.update();
    });

}