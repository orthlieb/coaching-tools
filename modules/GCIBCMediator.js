/*
 * @module modules/Mediator
 * @author Carl Orthlieb
 */

import { ERROR } from "./Error.js";
import { COMMON } from "./Common.js";
import { DEBUG } from "./Debug.js";
import { STRINGS } from "./Strings.js";

import { BarChart } from "./BarChart.js";
import { CITable } from "./CITable.js";
import { LLPerson } from "./Person.js";
        
/** @class */
export class GCIBCMediator {
    /**
     * Mediator for Datatables Group Barchart
     * @param {array} data Array of people objects (unvalidated).
     * @param {string} tableId Id of the table element to use for individual people.
     * @param {string} graphId Id of the graph element to use.
     * @returns Mediator object
     * @constructor
     */
    constructor(data, tableId, graphId) {
        this.debounce = true;
        this.people = this._validateData(data);
        this.people.forEach((person, index, array) => person.state = true);

        let companyName = this.people[0].companyName;
        if (companyName)
            $('.companyname').html(companyName).removeClass('d-none');
        
        this.theTable = new CITable(tableId, this.people, this);

        // Columns holds the state of whether a particular dataset is visible or hidden.
        this.columnState = {};
        COMMON.ciKeys.forEach(key => this.columnState[key] = true);
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
                ERROR.appendAlert(e, 'error');
            }
        }
        
        ERROR.assert(people.length > 0, "Mediator._validatePerson need at least one valid person in incoming data, person count is 0");

        DEBUG.log('## people', people);    
        
        return people;
    }

    /**
     * Get CI scores for people
     * @method
     * @param {array} people An array of person objects.
     * @returns {array} Array of objects, with key, min, avg, and max values for each Communication Indicator.
     */
    _getCIScores(people) {
        DEBUG.logArgs('Mediator._getCIScores(people)', arguments);

        // Filter people with state true
        const activePeople = people.filter(person => person.state);

        // Calculate the min, max, and average values for each Life Language
        const scores = COMMON.ciKeys.map(key => {
            let nScale = key == 'interactiveStyle' ? 3 : 1;
            const values = activePeople.map(person => person[key]);
            const min = Math.min(...values) / nScale;
            const max = Math.max(...values) / nScale;
            const avg = values.reduce((sum, val) => sum + val, 0) / values.length / nScale;
            
            return { key, min, avg, max };
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

        const scores = this._getCIScores(people);
        let that = this;
        
        // Create datasets for the low to average and average to high values
        const minToAvgDataset = {
            label: 'Min to Avg',
            data: scores.map(score => [ Math.round(score.min), Math.round(score.avg) ]),
            backgroundColor: scores.map(score => COMMON.ciColors.solid[score.key]),
            borderColor: 'white',
            borderWidth: 1
        };

        const avgToMaxDataset = {
            label: 'Avg to Max',
            data: scores.map(item => Math.round(item.max - item.avg)), // Difference to stack on top
            backgroundColor: scores.map(score => COMMON.ciColors.solid[score.key]),
            borderColor: 'white',
            borderWidth: 1
        };
        
        const chartData = {
            labels: scores.map(item => STRINGS.ciLabels[item.key]),
            datasets: [ minToAvgDataset, avgToMaxDataset ],
            tooltip: {
                callbacks: {
                    // Customize the tooltip label for each individual bar
                    label: function(tooltipItem) {
                        const scores = that._getCIScores(people);
                        const dataIndex = tooltipItem.dataIndex;
                        
                        // Interactive Style
                        if (dataIndex == 1) {
                            let min = LLPerson.composeInteractiveStyle(scores[dataIndex].min * 3);
                            let avg = LLPerson.composeInteractiveStyle(scores[dataIndex].avg * 3);
                            let max = LLPerson.composeInteractiveStyle(scores[dataIndex].max * 3);
                            return `Min: ${Math.round(min[0])} ${min[1]} Avg: ${Math.round(avg[0])} ${avg[1]} Max: ${Math.round(max[0])} ${max[1]} `; 
                        }
                        
                        // Display the custom label with the value
                        return `Min: ${Math.round(scores[dataIndex].min)} Avg: ${Math.round(scores[dataIndex].avg)} Max: ${Math.round(scores[dataIndex].max)}`; 
                    }
                }
            }
        };
        
        DEBUG.log('## chartData', chartData);
        return chartData;        
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