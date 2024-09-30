/*
 * @module modules/PDTRGMediator
 * @author Carl Orthlieb
 */

import { ERROR } from "./Error.js";
import { LLKEYS, LLLABELS, LLCOLORS, LLCOLORS_LIGHT, LLCOLORS_BACKGROUND, LLCOLORS_DARK } from "./Common.js";
import { DEBUG } from "./Debug.js";

import { RadarChart } from "./RadarChart.js";
import { DTTable } from "./DTTable.js";
import { LLPerson } from "./Person.js";
        
/** @class */
export class PDTRGMediator {
    /**
     * Mediator for Datatables People Radar Graph
     * @param {array} data Array of people object (unvalidated)
     * @param {string} tableId Id of the table element to use.
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
        
        let tableData = this._prepTableData(this.people);
        this.theTable = new DTTable(tableId, tableData);
        this.theTable.mediator = this;
        
        // Columns holds the state of whether a particular dataset is visible or hidden.
        this.columnState = {};
        LLKEYS.forEach(key => this.columnState[key] = true);
        let chartData = this._prepChartData(this.columnState, this.people);
        this.theChart = new RadarChart(graphId, chartData);
        this.theChart.mediator = this;
    }
    
    /**
     * Validate the data passed into us. Will throw if there is invalid data.
     * @method
     * @param {array} data Array of people objects containing Life Language info.
     * @private
     */
    _validateData(data) {
        let people = [];
        for (let i = 0; i < data.length; i++) {
            try {
                let person = new LLPerson(data[i]);
                person.forEachLanguageScore((score, key, data) => data[key] = Math.round(score), person);
                person.id = i;
                people.push(person);
            } catch (e) {
                DEBUG.log(e);
                ERROR.appendAlert(e, 'error');
            }
        }
        return people;
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
        //data: {
        //    labels: ['Mover', 'Doer', ...],
        //    datasets: [{
        //        label: 'John Doe',
        //        data: [65, 59, 90, 81, 56, 55],
        //        backgroundColor: LLCOLORS_BACKGROUND[nIndex],
        //        borderColor: LLCOLORS[nIndex]
        //    }... ]
        //},
        DEBUG.logArgs('_prepChartData', arguments);
        let chartData = {
            labels: LLKEYS.filter((key, index, array) => columnState[key]).map((key) => LLLABELS[key]),     
            datasets: people.map((person, index, array) => {
                let hue = (index * 137) % 360;
                return {
                    id: index,
                    label: person.fullName,
                    data: LLKEYS.filter(key => columnState[key]).map(key => person[key]),
                    ids: LLKEYS.filter(key => columnState[key]),
                    backgroundColor: `hsla(${hue}, 70%, 50%, 25%)`,            
                    borderColor: `hsl(${hue}, 70%, 50%)`,
                    fill: true,
                    hidden: !person.state
                };
            })
        };
              
        return chartData;        
    }

    /**
     * Prepare the data for use in the table.
     * @method
     * @param {array} people An array of person objects.
     * @returns {object} Prepared data for initializing and loading the table.
     * @private
     */
    _prepTableData(people) {
        let columns = LLKEYS.map(key => { return { 
            name: key, data: key, title: LLLABELS[key][0], orderSequence: ['desc', 'asc'] }; });
        columns.unshift({ name: 'name', data: 'fullName', title: 'Name' });
        columns.unshift({ data: 'state', title: '' });
        let tableData = {
            data: people,
            columns: columns
        };

        return tableData;
    }
         
    /**
     * Event listener when one of the rows in the table is unselected.
     * @method
     * @param {array} aRows Array of row data that was selected.
     * @param {boolean} bSelect True if rows are to be selected, false otherwise.
     * @public
     */
    tableSelectRow(aRows, bSelect) {
        DEBUG.logArgs('PDTRGMediator.tableSelectRow(aRows, bSelect)', arguments);
        
        if (this.debounce) {
            this.debounce = false;
            aRows.forEach(row => {
                const person = this.people.find(person => person.id === row.id);
                person.state = bSelect;
                this.theChart.hideDataset(row.id, !bSelect);
            });
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
        DEBUG.logArgs('PDTRGMediator.tableHideColumn(key, bChecked)', arguments);
        
        if (this.debounce) {
            this.debounce = false;
            // Because we are affecting an axis of the chart, we have to reload it.
            this.columnState[key] = bChecked;
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
        DEBUG.logArgs('PDTRGMediator.graphClickLegend(nIndex, bChecked)', arguments);
    
        // nIndex is the person
         if (this.debounce) {
            this.debounce = false;
            const person = this.people.find(person => person.id === nIndex);
            person.state = !bHidden;
            this.theTable.selectRow(nIndex, !bHidden);
            this.debounce = true;
         }
    }
}