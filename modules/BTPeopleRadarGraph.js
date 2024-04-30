import { ERROR } from "./Error.js";
import { LLKEYS, LLCOLORS, LLCOLORS_LIGHT } from "./Common.js";
import { DEBUG } from "./Debug.js";

/**
 * Validate incoming person object.
 * @param {object} person Person data to be validated.
 * Will throw if there is invalid data.
 */
function validatePerson(person) {
    ERROR.assert(
        "fullName" in person,
        "validatePerson missing parameter person.fullName"
    );
    ERROR.assertType(
        person.fullName,
        "string",
        `validatePerson "${person.fullName}" parameter person.fullName`
    );

    ERROR.assert(
        "overallIntensity" in person,
        "validatePerson missing parameter person.overallIntensity"
    );
    ERROR.assertType(
        person.overallIntensity,
        "number",
        `validatePerson "${person.fullName}" parameter person.overallIntensity`
    );

    ERROR.assertType(
        person.companyName,
        "string",
        `validatePerson "${person.companyName}" parameter person.companyName`
    );

    for (let cKey of LLKEYS) {
        ERROR.assert(
            cKey in person,
            `validatePerson "${person.fullName}" missing parameter person.${cKey}`
        );
        ERROR.assertType(
            person[cKey],
            "number",
            `validatePerson "${person.fullName}" parameter person.${cKey}`
        );
        ERROR.assertRange(
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
    ERROR.assert(data.length > 2, `validateData not enough people for generating radar graph, must be > 2, found ${data.length}`);
    for (let i = 0; i < data.length; i++) {
        try {
            validatePerson(data[i]);
        } catch (e) {
            DEBUG.log(e);
            ERROR.appendAlert(e, 'error');
        }
    }
}

function updateRadarGraph(theChart, people) {
      // Radar graph
    const chartData = {
        labels: LLKEYS.map((key) => { return key.charAt(0).toUpperCase() + key.slice(1); }),
        datasets: []
    };
    
    people.forEach(person => {
       chartData.datasets.push({
           label: person.fullName,
           data: [ person.mover, person.doer, person.influencer, person.responder,
                   person.shaper, person.producer, person.contemplator ],
           fill: true,
           hidden: !person.state
        });
    });
    
    theChart.data = chartData;
    theChart.update(); 
}

/**
 * Draw a radar graph where each element in the data set is the person and the axes are Life Languages.
 * @param {array} people Array of person objects.
 * @param {element} element Element to draw the graph into.
 * @returns {object} The created chart object.
 */
function drawRadarGraph(people) {
    let nPeople = people.length;
    
    // Radar graph
    const chartData = {
        labels: LLKEYS.map((key) => { return key.charAt(0).toUpperCase() + key.slice(1); }),
        datasets: []
    };
    
    for (let person of people) {
       chartData.datasets.push({
            label: person.fullName,
            data: [ person.mover, person.doer, person.influencer, person.responder,
                   person.shaper, person.producer, person.contemplator ],
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
    let theChart = new Chart($('#rg-graph'), config);

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
 * Evaluates whether Score is VERY LOW, LOW, MODERATE, HIGH or VERY HIGHT.
 * @param {number} nValue The value to be evaluated.
 * @returns {string} Returns the arrow corresponding the score.
 */
function evaluateScoreArrow(nValue) {
    if (nValue < 15) return '<i class="bi bi-arrow-down score-arrow"></i>';// "\D83E\DC7B"; // "&#x1F87B;"; // down
    else if (nValue < 35) return '<i class="bi bi-arrow-down-right score-arrow"></i>'; // ""&#x1F87E;"; // down-right
    else if (nValue < 65) return '<i class="bi bi-arrow-right score-arrow"></i>'; // "&#x1F87A;"; // right
    else if (nValue < 85) return '<i class="bi bi-arrow-up-right score-arrow"></i>';// "&#x1F87D;"; // up-right
    return '<i class="bi bi-arrow-up score-arrow"></i>'; //"\D83E\DC70"; //"&#x1F879;"; // up
}

export function groupAverageLabel(data) {
    return 'Group Average';
}

function getAverageForField(data, field) {
    //DEBUG.logType('getAverageForField', field);
    const result = data.reduce((acc, person) => {
        if (person.state) {
            acc.nPeople++;
            acc.nSum += person[field];
        }
        return acc;
    }, { nPeople: 0, nSum: 0 });
    let nAverage = result.nPeople ? result.nSum / result.nPeople : 0;
    //DEBUG.log('Field:', field, 'Average:', nAverage, 'Num people:', result.nPeople);
    return nAverage;
}

export function avgFooterFormatter(data, field) {    
    field = (field == '') ? this.field : field;
    //DEBUG.logType('avgFooterFormatter After', field);

    let nAverage = Math.round(getAverageForField(data, field));
    let cText = nAverage ? `${evaluateScoreArrow(nAverage)} ${Math.round(nAverage)}` : '';
    return `<span id="footer-${field}">${cText}</span>`;
}

function updateTableFooter() {
    let data = $('#rg-table').bootstrapTable('getData');
    let $footers = $('span[id^="footer-"]');
    //DEBUG.log('Updating', $footers.length, 'footers.');
    $footers.each((index, footer) => {    
        // Strip off the 'footer-' prefix using a regular expression
        let field = $(footer).attr('id').replace(/^footer-/, '');
        //DEBUG.logType('updateTableFooter', field);
        $(footer).html(avgFooterFormatter(data, field));
    });    
}

/**
 * Main function to draw the Radar Graph and corresponding table.
 * @param {array} data An array containing people objects with their name and Life Language scores.
 */
export function displayRadarGraphAndTable(data) {
    validateData(data);
        
    $('.companyname').html(data[0].companyName);
    DEBUG.logType('Company Name', data[0].companyName);
    DEBUG.logType('Company Element', $('.companyname').id);
    
    // Data prep
    let id = 0;
    data.forEach(person => {
        person.state = true;       // Checkboxes should be selected.
        person.id = id++;          // Give each person a unique id.
    });
    DEBUG.log('Validated Data', JSON.stringify(data));

        
    let $table = $("#rg-table");
    $table.bootstrapTable('load', data);
        
    let theChart = drawRadarGraph($table.bootstrapTable('getData'));
    
    // Table events
    $table.bootstrapTable('refreshOptions', {
        onCheck: (row, $element) => {
            DEBUG.log('Check', row.id, row.fullName);
            // The row in the table and the dataset indx in the chart do not necessarily match.
            theChart.data.datasets.forEach(dataset => {  
                if (dataset.label == row.fullName) {
                    dataset.hidden = false; 
                    theChart.update();
                }
            });
            updateTableFooter();
        },
        onUncheck: (row, $element) => {
            DEBUG.log('Uncheck', row.id, row.fullName);
            // The row in the table and the dataset indx in the chart do not necessarily match.
            theChart.data.datasets.forEach(dataset => {  
                if (dataset.label == row.fullName) {
                    dataset.hidden = true; 
                    theChart.update();
                }
            });
            updateTableFooter();
      },
        onCheckAll: (rowsAfter, rowsBefore) => {
            DEBUG.log('Check All');
            theChart.data.datasets.forEach(dataset => { dataset.hidden = false; });
            theChart.update();
             updateTableFooter();
       },
        onUncheckAll: (rowsAfter, rowsBefore) => {
            DEBUG.log('Uncheck All');
            theChart.data.datasets.forEach(dataset => { dataset.hidden = true; });
            theChart.update();
            updateTableFooter();
        },
        onPostBody: (data) => {
            DEBUG.log('Post Body', JSON.stringify(data));
            
            // Clear current header and body formatting.
            $(`#rg-table > tbody > tr`).removeClass((index, className) => className.match(/\S+-top-border/g));
            $(`#rg-table th`).removeClass((index, className) => className.match(/\S+-light-background/g));
            $(`#rg-table th`).removeClass((index, className) => className.match(/\S+-text-color/g));

            // Look at the headers to see which one is the sort column.
            //<div class="th-inner sortable both">&nbsp;</div>
            $('div.th-inner.sortable').each((index, element) => {
                let $element = $(element);
                let bAscending = $element.hasClass('asc');
                let bDescending = $element.hasClass('desc');
                if (bAscending || bDescending) {
                    let dataField = $element.parent().attr('data-field');
                    
                    // Header and footer of the sorted field get highlighted for visual reference
                    // #rg-table > thead > tr:nth-child(1) > th.col-1.vertical.mover
                    $(`#rg-table th.${dataField}`).addClass(`${dataField}-light-background ${dataField}-text-color`);
 
                    // Determine where to draw 50 line in the table.
                    let bFlag = false;
                    data.forEach((person, index) => {
                        if (!bFlag && ((bAscending && person[dataField] > 50) || (bDescending && person[dataField] < 50))) {
                            bFlag = true;
                            // #rg-table > tbody > tr:nth-child(1)
                            $(`#rg-table > tbody > tr:nth-child(${index + 1})`).addClass(`${dataField}-border-top`);
                        }
                    });
                }
            });
        }
    });
}