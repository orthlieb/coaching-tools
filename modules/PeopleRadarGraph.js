import { ASSERT, ASSERT_TYPE, ASSERT_RANGE } from "./Error.js";
import { LLKEYS, LLCOLORS, LLCOLORS_LIGHT } from "./Common.js";

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
 * Validate incoming person.
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
        `validatePerson "${person.companyName}" parameter person.fullName`
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
    if (nValue < 15) return "&#x1F87B;"; // down
    else if (nValue < 35) return "&#x1F87E;"; // down-right
    else if (nValue < 65) return "&#x1F87A;"; // right
    else if (nValue < 85) return "&#x1F87D;"; // up-right
    return "&#x1F879;"; // up
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
 * @param {number} nPerson1 Person 1 to compare against.
 * @param {number} nPerson2 Person 2 to compare against.
 */
export function displayRadarGraph(cSuffix, data, nPerson1, nPerson2) {
    validateData(data);

    let rgElement = document.getElementById("radar-graph-" + cSuffix);

    let rgTitle = rgElement.querySelector(".title");
    rgTitle.innerText = `Radar Graph Comparison for ${data[nPerson1].fullName} and ${data[nPerson2].fullName}`;

    let rgCompanyName = rgElement.querySelector(".companyname");
    rgCompanyName.innerText = data[0].companyName;

    // Table Header
    let rgTable = rgElement.querySelector(".score-header");
    rgTable.innerHTML = '<tr><th class="gray-background">Name</th>';
    for (let key of LLKEYS) {
        rgTable.innerHTML += `<th class="gray-background capitalize">${key}</th>`;
    }
    rgTable.innerHTML += '</tr>';

    // Table Body
    let aSortedByPeopleAscending = sortScores(data, 'fullName', LLKEYS);
    console.log("Sorted Scores", JSON.stringify(aSortedByPeopleAscending));
    rgTable = rgElement.querySelector(".score-body");
    let cTableBody = "";
    let nPeople = aSortedByPeopleAscending.fullName.length;
    for (let i = 0; i < nPeople; i++) {
        // Shade even rows
        let cClass = '';
        if ((i + 1) % 2 == 0) 
            cClass += "gray-light-background ";

        cTableBody += `<tr><td class=${cClass}>${aSortedByPeopleAscending.fullName[i]}</td>`;
        for (let key of LLKEYS) {
            cTableBody += `<td class="${cClass}">${aSortedByPeopleAscending[key][i]}</td>`;
        }
        cTableBody += "</tr>";
    }
    rgTable.innerHTML = cTableBody;

    // Table Footer
    rgTable = rgElement.querySelector(".score-footer");

    let nAverageOverallIntensity = Math.round(
        aSortedByScoresDescending.overallIntensity.reduce(
            (acc, curr) => acc + curr,
            0
        ) / aSortedByScoresDescending.overallIntensity.length
    );
    let nAverageScore = Math.round(
        aSortedByScoresDescending[key].reduce(
            (acc, curr) => acc + curr,
            0
        ) / aSortedByScoresDescending[key].length
    );

    rgTable.innerHTML = `<tr>
        <td class="${cBack}">Group Average</td>
        <td  class="${cBack}">${nAverageOverallIntensity}</td>
        <td  class="${cBack}">${nAverageScore} ${evaluateScoreArrow(
        nAverageScore
    )}</td>
    </tr>`;
    rgTable.style.backgroundColor = LLCOLORS[key];

    // Radar graph
    const chartData = {
        labels: aSortedByPeopleAscending.fullName,
        datasets: [
            {
                label: `${cTitle} Life Language`,
                data: aSortedByPeopleAscending[key],
                fill: true,
                backgroundColor: solidToTransparentColor(
                    LLCOLORS[key],
                    0.2
                ),
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
    new Chart(rgElement.querySelector(".radarGraph"), config);

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