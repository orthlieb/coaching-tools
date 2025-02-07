/*
 * @module modules/PBCMediator
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
        const scores = person.sortedScores.map(score => {
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
            labels: scores.map(score => STRINGS.labels[score.key]), // Use labels for Life Languages
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
        
        document.getElementById('fullname').textContent = person.fullName;
        if (person.companyName)
            document.getElementById('companyname').textContent = person.companyName;
        
        // Loop through each row and update the corresponding values
        const table = document.getElementById('the-ll-table');
        const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
        [...rows].forEach((row, index) => {
            row.querySelector('.lllanguage').textContent = STRINGS.labels[person.sortedScores[index].key];
            row.querySelector('.llscore').textContent = person.sortedScores[index].value;
            row.querySelector('.llrating').textContent = STRINGS.scoreLevelLabels[person.sortedScores[index].valueLevel];
            
            let score = person.sortedScores[index];
            if (index != 0) {
                let cGapSymbol = [
                    '<i class="gap-compressed fa-solid fa-down-left-and-up-right-to-center fa-rotate-by" style="--fa-rotate-angle: 45deg;"></i>',
                    '',
                    '<i class="gap-expanded fa-solid fa-up-right-and-down-left-from-center fa-rotate-by" style="--fa-rotate-angle: 135deg;"></i>'];
                if (score.gapLevel != 1) {
                    COMMON.createPopupDialog(`gap-icon-${index}`, `${STRINGS.general.gap}: ${STRINGS.gapLevels[score.gapLevel]}`, 
                        `${STRINGS.gap.pre}<br><br>${STRINGS.gap.info[score.gapLevel]}<br><br>${STRINGS.gap.post}`, cGapSymbol[score.gapLevel] );
                }
                row.querySelector(`#gap-icon-${index}`).innerHTML = cGapSymbol[score.gapLevel];
                row.querySelector(`#gap-${index}`).innerHTML = Math.round(score.gap);
            }
        });
        
        // Handle the table footer.
        document.getElementById('llrange').textContent = person.range;
        COMMON.createPopupDialog('llrange-info', `${STRINGS.general.range}: ${STRINGS.scoreLevelLabels[person.rangeLevel]}`,
            `${STRINGS.range.pre}<br><br>${STRINGS.range.info[person.rangeLevel]}<br><br>${STRINGS.range.post}`); 
        document.getElementById('lloi').textContent = person.overallIntensity; 
        document.getElementById('lloirating').textContent = STRINGS.scoreLevelLabels[person.overallIntensityLevel];
        COMMON.createPopupDialog('lloi-info', `${STRINGS.llLevelInfo.overallIntensity.name}: ${STRINGS.scoreLevelLabels[person.overallIntensityLevel]}`,
            `${STRINGS.llLevelInfo.overallIntensity.pre}<br><br>${STRINGS.llLevelInfo.overallIntensity.info[person.overallIntensityLevel]}<br><br>${STRINGS.llLevelInfo.overallIntensity.post}`); 
    }

}