/*
 * @module modules/Mediator
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
export class PBCMediator {
    /**
     * Mediator for Personal Barchart (Profile Short Form)
     * @param {array} data Array of people objects (unvalidated).
     * @param {string} tableLLId Id of the table element to use for group scores.
     * @param {string} graphId Id of the graph element to use.
     * @returns Mediator object
     * @constructor
     */
    constructor(data, tableIdLL, graphId) {
        DEBUG.logArgs('Mediator.constructor(data, tableIdLL, graphId)', arguments);
        this.debounce = true;
        this.person = this._validateData(data);

        let companyName = this.person.companyName;
        if (companyName)
            $('.companyname').html(companyName).removeClass('d-none');
        
        this._loadProfileTable(this.person);

        // Columns holds the state of whether a particular dataset is visible or hidden.
        this.columnState = {};
        COMMON.llKeys.forEach(key => this.columnState[key] = true);
        let chartData = this._prepChartData(this.columnState, this.person);
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
        
        let person = new LLPerson(data);

        return person;
    }

    /**
     * Get sorted scores for a person
     * @method
     * @param {object} person A person object.
     * @returns {array} Array of sorted objects, with key, min, avg, and max values for each Life Language.
     */
    _getSortedScores(person) {
        DEBUG.logArgs('Mediator._getSortedScores(person)', arguments);

        // Calculate the min, max, and average values for each Life Language
        const scores = COMMON.llKeys.map(key => {
            return { 
                key: key, 
                value: person[key], 
                languageLabel: STRINGS.labels[key], 
                rating: STRINGS.scoreLabels[COMMON.evaluateScoreLevel(person[key])] 
            };
        });

        // Sort the scores in descending order by average score
        scores.sort((a, b) => b.value - a.value);   
        
        // Calculate the score order label and gap.
        let lastScore = 0;
        scores.map((score, index) => {
            score.gap = Math.max(lastScore - score.value, 0);
            lastScore = score.value;
            
            return score;
        });
        
        return scores;
    }
    
     /**
     * Prepare the data for use in the chart for a single person.
     * @method
     * @param {object} columnState A set of key value pairs indicating which columns are shown.
     * @param {object} person A person object.
     * @returns {object} Prepared data for initializing and loading the chart.
     * @private
     */
    _prepChartData(columnState, person) {
        DEBUG.logArgs('Mediator._prepChartData(columnState, person)', arguments);

        // Prepare scores for a single person
        const scores = this._getSortedScores(person).map(score => {
            score.color = COMMON.colors.solid[score.key];
            return score;
        });

        // Prepare datasets
        const dataset = {
            label: person.fullName,
            data: scores.map(score => score.value),
            backgroundColor: scores.map(score => score.color),
            borderColor: 'white',
            borderWidth: 1
        };

        // Prepare chart data
        const chartData = {
            labels: scores.map(score => score.languageLabel), // Use labels for Life Languages
            datasets: [dataset],
            annotations: this._prepAnnotationData(scores.map(score => score.value)) // Optional annotation logic
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
     * @param {object} person A person object.
     * @returns {object} Prepared data for initializing and loading the table.
     * @private
     */
    _loadProfileTable(person) {
        DEBUG.log('Mediator._loadProfileTable(scores)', arguments);
        
        const scores = this._getSortedScores(person);
        
        document.getElementById('fullname').textContent = person.fullName;
        if (person.companyName)
            document.getElementById('companyname').textContent = person.companyName;
        
        // Loop through each row and update the corresponding values
        const table = document.getElementById('the-ll-table');
        const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
        [...rows].forEach((row, index) => {
            row.querySelector('.lllanguage').textContent = scores[index].languageLabel;
            row.querySelector('.llscore').textContent = scores[index].value;
            row.querySelector('.llrating').textContent = scores[index].rating;
            
            let cGapSymbol = '';
            if (index != 0) {
                if (scores[index].gap < 5) {
                    cGapSymbol = '<i class="bi bi-arrows-collapse"></i>';
                    COMMON.createInfoDialog(`gap-icon-${index}`, `${STRINGS.general.gap}: ${STRINGS.general.low}`, 
                        `${STRINGS.gap.pre} ${STRINGS.gap.info[0]} ${STRINGS.gap.post}`);
                } else if (scores[index].gap > 10) {
                    cGapSymbol = '<i class="bi bi-arrows-expand"></i>';
                    COMMON.createInfoDialog(`gap-icon-${index}`, `${STRINGS.general.gap}: ${STRINGS.general.high}`, 
                        `${STRINGS.gap.pre} ${STRINGS.gap.info[2]} ${STRINGS.gap.post}`);
                }
                row.querySelector(`#gap-icon-${index}`).innerHTML = cGapSymbol;
                row.querySelector(`#gap-${index}`).innerHTML = scores[index].gap;
            }
        });
        
        // Handle the table footer.
        const nRange = Math.abs(scores[0].value - scores[6].value);
        const nRangeIndex = COMMON.evaluateScoreLevel(nRange);
        const nRatingIndex = COMMON.evaluateScoreLevel(person.overallIntensity);

        document.getElementById('llrange').textContent = nRange;
        COMMON.createInfoDialog('llrange-info', `${STRINGS.general.range}: ${STRINGS.scoreLabels[nRangeIndex]}`,
            `${STRINGS.range.pre} ${STRINGS.range.info[nRangeIndex]} ${STRINGS.range.post}`); 
        document.getElementById('lloi').textContent = person.overallIntensity; 
        document.getElementById('lloirating').textContent = STRINGS.scoreLabels[nRatingIndex];
        COMMON.createInfoDialog('lloi-info', `${STRINGS.general.overallIntensity}: ${STRINGS.scoreLabels[nRatingIndex]}`,
            `${STRINGS.overallIntensity.pre} ${STRINGS.overallIntensity.info[nRatingIndex]} ${STRINGS.overallIntensity.post}`); 
    }

}