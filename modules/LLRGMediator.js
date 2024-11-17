/*
 * @module modules/LLRGMediator
 * @author Carl Orthlieb
 */

import { ERROR } from "./Error.js";
import { COMMON } from "./Common.js";
import { DEBUG } from "./Debug.js";
import { STRINGS } from "./Strings.js";

import { RadarChart } from "./RadarChart.js";
import { LLTable } from "./LLTable.js";
import { LLPerson } from "./Person.js";

/** @class */
export class LLRGMediator {
    /**
     * Mediator for Data Table Life Language Radar Graph
     * @param {array} data Array of people object (unvalidated)
     * @param {string} tableId Id of the table element to use.
     * @param {string} graphId Id of the graph element to use.
     * @returns Mediator object
     * @constructor
     */
    constructor(data, tableId, graphId) {
        this.debounce = true;
        this.people = this._validateData(data);
        
        let companyName = this.people[0].companyName;
        if (companyName)
            $('.companyname').html(companyName).removeClass('d-none');
        
        this.theTable = new LLTable(tableId, this.people, this);
        
        // Columns holds the state of whether a particular dataset is visible or hidden.
        this.columnState = {};
        COMMON.llKeys.forEach(key => this.columnState[key] = true);
        let chartData = this._prepChartData(this.columnState, this.people);
        this.theChart = new RadarChart(graphId, chartData, { displayLegend: true, legendPosition: 'bottom' }, this);
    }
    
    /**
     * Validate the data passed into us.
     * @param {array} data Array of people objects containing Life Language info.
     * Will throw if there is invalid data.
     * @private
     */
    _validateData(data) {
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

        return people;
    }

    /**
     * Prepare the data for use in the chart.
     * @param {object} columnState A set of key value pairs indicating which columns are shown.
     * @param {array} people An array of person objects.
     * @returns {object} Prepared data for initializing and loading the chart.
     * @private
     */
    _prepChartData(columnState, people) {
        //data: {
        //    labels: ['Person 1', ...],
        //    datasets: [{
        //        label: 'Mover'',
        //        data: [65, 59, 90, 81, 56, 55],
        //        backgroundColor: COMMON.colors.solid_BACKGROUND[nIndex],
        //        borderColor: COMMON.colors.solid[nIndex]
        //    }... ]
        //},

        let chartData = {
            labels: people.filter(person => person.state).map(person => person.fullName),     
            datasets: []
        };
        COMMON.llKeys.forEach((key) => {
            chartData.datasets.push({
                label: STRINGS.labels[key],
                data: people.filter(person => person.state).map(person => person[key]),
                ids: people.filter(person => person.state).map(person => person.id),
                backgroundColor: COMMON.colors.background[key], 
                borderColor: COMMON.colors.solid[key],
                fill: true,
                hidden: !columnState[key]
            });
        });
            
        return chartData;        
    }

    /**
     * Event listener when one of the rows in the table is unselected.
     * @param {array} aRows Array of row data that was selected.
     * @param {boolean} bSelect True if rows are to be selected, false otherwise.
     * @public
     */
    tableSelectRow(aRows, bSelect) {
        DEBUG.logArgs('LLRGMediator.tableSelectRow(rows, bSelect)', arguments);
        
        if (this.debounce) {
            this.debounce = false;
            aRows.forEach(row => {
                const person = this.people.find(person => person.id === row.id);
                person.state = bSelect;
            });

            // Because we are affecting an axis of the chart, we have to reload it.
            let chartData = this._prepChartData(this.columnState, this.people);
            this.theChart.loadData(chartData);
            this.debounce = true;
        }
    }
    
    /**
     * Event listener when an entry in the chart legend is clicked.
     * @method
     * @param {integer} nIndex Index of the item in the dataset that was clicked.
     * @param {boolean} bHidden Should the entry be hidden or not.
     * @public
     */
    graphClickLegend(nIndex, bHidden) {
       DEBUG.logArgs('LLRGMediator.graphClickLegend(nIndex, bHidden)', arguments);
        
        if (this.debounce) {
            this.debounce = false;
            let key = COMMON.llKeys[nIndex];
            this.columnState[key] = !bHidden;
            this.theTable.hideColumn(key, bHidden);
            this.debounce = true;
        }
    }
    
    /**
     * Event listener when a column is hidden/shown in the table.
     * @param {string} key Column that was selected.
     * @param {boolean} bChecked Should the column be shown or not.
     * @public
     */
    tableHideColumn(key, bChecked) {
        DEBUG.logArgs('LLRGMediator.tableHideColumn(key, bChecked)', arguments);
        
        if (this.debounce) {
            this.debounce = false;
            // Because we are affecting a dataset in the chart we can use the built-in hideDataset instead of reloading.
            this.columnState[key] = bChecked;
            this.theChart.hideDataset(COMMON.llKeys.indexOf(key), !bChecked);
            this.debounce = true;
        }
    }
}
