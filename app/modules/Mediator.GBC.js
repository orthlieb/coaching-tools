/*
 * @module modules/GBCMediator
 * @author Carl Orthlieb
 */

import { ERROR } from "./Error.js";
import { COMMON } from "./Common.js";
import { DEBUG } from "./Debug.js";
import { STRINGS } from "./Strings.js";

import { BarChart } from "./BarChart.js";
import { LLTable } from "./LLTable.js";
import { LLPerson } from "./Person.js";
        
/** @class */
export class GBCMediator {
    /**
     * Mediator for Group Barchart
     * @param {array} data Array of people objects (unvalidated).
     * @param {string} tableId Id of the table element to use for individual people.
     * @param {string} tableLLId Id of the table element to use for group scores.
     * @param {string} graphId Id of the graph element to use.
     * @returns Mediator object
     * @constructor
     */
    constructor(data, tableId, tableIdLL, graphId) {
        this.debounce = true;
        this.people = this._validateData(data);
        this.people.forEach((person, index, array) => person.state = true);

        let companyName = this.people[0].companyName;
        if (companyName)
            $('.companyname').html(companyName).removeClass('d-none');
        
        this.theTable = new LLTable(tableId, this.people, this);

        this._loadProfileTable(this.people);

        // Columns holds the state of whether a particular dataset is visible or hidden.
        this.columnState = {};
        COMMON.llKeys.forEach(key => this.columnState[key] = true);
        let chartData = this._prepChartData(this.columnState, this.people);
        this.theChart = new BarChart(graphId, chartData, { displayLegend: false }, this);
    }
    
    /**
     * Validate the data passed into us. Will throw if there is invalid data.
     * @method
     * @param {array} data Array of people objects containing Life Language info.
     * @private
     */
    _validateData(data) {
        DEBUG.logArgs('Mediator._validateData(data)', arguments);

        let people = [];
        for (let i = 0; i < data.length; i++) {
            try {
                let person = new LLPerson(data[i]);
                people.push(person);
            } catch (e) {
                DEBUG.log(e);
                COMMON.displayAlertInDoc(e);
            }
        }
        
        ERROR.assert(people.length > 0, "Mediator._validatePerson need at least one valid person in incoming data, person count is 0");

        return people;
    }

    /**
     * Get sorted scores for people
     * @method
     * @param {array} people An array of person objects.
     * @returns {array} Array of sorted objects, with key, min, avg, and max values for each Life Language.
     */
    _getSortedScores(people) {
        DEBUG.logArgs('Mediator._getSortedScores(people)', arguments);

        // Filter people with state true
        const activePeople = people.filter(person => person.state);

        // Calculate the min, max, and average values for each Life Language
        const scores = COMMON.llKeys.map(key => {
            const values = activePeople.map(person => person[key]);
            const min = Math.round(Math.min(...values));
            const max = Math.round(Math.max(...values));
            const avg = Math.round(values.reduce((sum, val) => sum + val, 0) / values.length);
            const rating = STRINGS.scoreLevelLabels[COMMON.evaluateScoreLevel(avg)];
            const languageLabel = STRINGS.labels[key];

            // Calculate standard deviation: this is how spread or clumped the data is. 1 = very concentrated, 0 = spread out
            const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
            const stdDev = Math.round(Math.sqrt(variance));
            
            return { key, min, avg, max, stdDev, rating, languageLabel };
        });

        // Sort the scores in descending order by average score
        scores.sort((a, b) => b.avg - a.avg);   
        
        // Calculate the score order label and gap.
        let lastScore = 0;
        scores.map((score, index) => {
            score.gap = Math.max(lastScore - score.avg, 0);
            lastScore = score.avg;
            
            return score;
        });
        
        return scores;
    }
    
    /**
     * Prepare the data for use in the chart.
     * @method
     * @param {object} columnState A set of key value pairs indicating which columns are shown.
     * @param {array} people An array of person objects.
     * @returns {object} Prepared data for initializing and loading the chart.
     * @private
     */
    _prepChartData(columnState, people) {
        DEBUG.logArgs('Mediator._prepChartData(columnState, people)', arguments);

        const scores = this._getSortedScores(people);
        let that = this;
        
        // Create datasets for the low to average and average to high values
        const minToAvgDataset = {
            label: 'Min to Avg',
            data: scores.map(score => [ score.min, score.avg ]),
            backgroundColor: scores.map(score => COMMON.colors.solid[score.key]),
            borderColor: 'white',
            borderWidth: 1
        };

        const avgToMaxDataset = {
            label: 'Avg to Max',
            data: scores.map(item => item.max - item.avg), // Difference to stack on top
            backgroundColor: scores.map(item =>  COMMON.colors.solid[item.key]),
            borderColor: 'white',
            borderWidth: 1
        };
        
        const chartData = {
            labels: scores.map(item => STRINGS.labels[item.key]),
            datasets: [ minToAvgDataset, avgToMaxDataset ],
            annotations: this._prepAnnotationData(scores.map(item => item.avg)),
            tooltip: {
                callbacks: {
                    // Customize the tooltip label for each individual bar
                    label: function(tooltipItem) {
                        const scores = that._getSortedScores(people);
                        const dataIndex = tooltipItem.dataIndex;
                        
                        // Display the custom label with the value
                        return `Min: ${scores[dataIndex].min} Avg: ${scores[dataIndex].avg}\nMax: ${scores[dataIndex].max}`; 
                        // Spread: ${Math.round(scores[dataIndex].stdDev / (scores[dataIndex].max - scores[dataIndex].min) * 100)}%`;
                    }
                }
            }
        };
        
        return chartData;        
    }
    
   /**
     * Prepare annotations for the chart.
     * @method
     * @param {array} scores Scores that will be displayed. Assumed to be in ascending or descending order.
     * @returns {object} Prepared data for the annotations.
     * @private
     */
    _prepAnnotationData(scores) {
        DEBUG.logArgs('Mediator._prepAnnotationData(scores)', arguments);

        let yMin = Math.round(Math.min(scores[0], scores[scores.length - 1]));
        let yMax = Math.round(yMin + Math.abs(scores[0] - scores[scores.length - 1]));
        
        const annotationData = {
            // Range box
            box1: {
                // This will be the range as a gray box
                type: 'box',
                xMin: -0.5,
                xMax: 6.5,
                yMin: yMin,
                yMax: yMax,
                borderWidth: 0,
                backgroundColor: 'lightgray',
                drawTime: 'beforeDatasetsDraw'
            },
            // 50 line for the chart.
            line1: {
                type: 'line',
                yMin: 50,
                yMax: 50,
                borderColor: 'darkgray',
                borderWidth: 1,
                drawTime: 'beforeDatasetsDraw'
            }
        };   
        
        return annotationData;
    }

    /**
     * Update the data in the LL table.
     * @method
     * @param {array} scores Scores that will be displayed. Assumed to be in ascending or descending order.
     * @returns {object} Prepared data for initializing and loading the table.
     * @private
     */
    _loadProfileTable(people) {
        DEBUG.log('Mediator._loadProfileTableValues(scores)', arguments);
        
        const scores = this._getSortedScores(people);
        
        // Loop through each row and update the corresponding values
        const table = document.getElementById('the-ll-table');
        const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
        [...rows].forEach((row, index) => {
            row.querySelector('.lllanguage').textContent = scores[index].languageLabel;
            row.querySelector('.llscore').textContent = scores[index].avg;
            row.querySelector('.llrating').textContent = scores[index].rating;
            
            let cGapSymbol = '';
            if (index != 0) {
                if (scores[index].gap < 5) {
                    cGapSymbol = '<i class="gap-compressed fa-solid fa-down-left-and-up-right-to-center fa-rotate-by" style="--fa-rotate-angle: 45deg;"></i>';
                    COMMON.createInfoDialog(`gap-icon-${index}`, `${cGapSymbol} &nbsp; ${STRINGS.general.gap}: ${STRINGS.general.low}`, 
                        `${STRINGS.gap.pre} ${STRINGS.gap.info[0]} ${STRINGS.gap.post}`);
                } else if (scores[index].gap > 10) {
                    cGapSymbol = '<i class="gap-expanded fa-solid fa-arrow-up-right-and-arrow-down-left-from-center fa-rotate-by" style="--fa-rotate-angle: 135deg;"></i>';
                    COMMON.createInfoDialog(`gap-icon-${index}`, `${cGapSymbol} &nbsp; ${STRINGS.general.gap}: ${STRINGS.general.high}`, 
                        `${STRINGS.gap.pre} ${STRINGS.gap.info[2]} ${STRINGS.gap.post}`);
                }
                row.querySelector(`#gap-icon-${index}`).innerHTML = cGapSymbol;
                row.querySelector(`#gap-${index}`).innerHTML = scores[index].gap;
            }
        });
        
        // Handle the table footer.
        const activePeople = people.filter(person => person.state);
        const nRange = Math.abs(scores[0].avg - scores[6].avg);
        const nRangeIndex = COMMON.evaluateScoreLevel(nRange);
        const overallIntensity = Math.round(activePeople.reduce((sum, person) => sum + person.overallIntensity, 0) / activePeople.length);
        const nRatingIndex = COMMON.evaluateScoreLevel(overallIntensity);

        document.getElementById('llrange').textContent = nRange;
        COMMON.createInfoDialog('llrange-info', `${STRINGS.general.range}: ${STRINGS.scoreLevelLabels[nRangeIndex]}`,
            `${STRINGS.range.pre} ${STRINGS.range.info[nRangeIndex]} ${STRINGS.range.post}`); 
        document.getElementById('lloi').textContent = overallIntensity; 
        document.getElementById('lloirating').textContent = STRINGS.scoreLevelLabels[nRatingIndex];
        COMMON.createInfoDialog('lloi-info', `${STRINGS.general.overallIntensity}: ${STRINGS.scoreLevelLabels[nRatingIndex]}`,
            `${STRINGS.overallIntensity.pre} ${STRINGS.overallIntensity.info[nRatingIndex]} ${STRINGS.overallIntensity.post}`); 
    }
    
    /**
     * Event listener when one of the rows in the table is selected/unselected.
     * @method
     * @param {array} aRows Array of row data that was selected.
     * @param {boolean} bSelect True if rows are to be selected, false otherwise.
     * @public
     */
    tableSelectRow(aRows, bSelect) {
        DEBUG.logArgs('Mediator.tableSelectRow(aRows, bSelect)', arguments);
        if (this.debounce) {
            this.debounce = false;
            aRows.forEach(row => {
                const person = this.people.find(person => person.id === row.id);
                person.state = bSelect;
            });
            
            this._loadProfileTable(this.people);
            
            let chartData = this._prepChartData(this.columnState, this.people);
            this.theChart.loadData(chartData);
            this.debounce = true;
        }
    }
    
    /**
     * Event listener when a column is hidden/shown in the table.
     * @method
     * @param {string} key Column that was selected.
     * @param {boolean} bChecked Should the column be shown or not.
     * @public
     */
    tableHideColumn(key, bChecked) {
        DEBUG.logArgs('Mediator.tableHideColumn(key, bChecked)', arguments);
    }
        
    /**
     * Event listener when an entry in the chart legend is clicked.
     * @method
     * @param {integer} nIndex Index of the item in the dataset that was clicked.
     * @param {boolean} bHidden Should the entry be hidden or not.
     * @public
     */
    graphClickLegend(nIndex, bHidden) {
        DEBUG.logArgs('Mediator.graphClickLegend(nIndex, bChecked)', arguments);
    }
}