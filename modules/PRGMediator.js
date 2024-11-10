/*
 * @module modules/Mediator
 * @author Carl Orthlieb
 */

import { ERROR } from "./Error.js";
import { COMMON } from "./Common.js";
import { DEBUG } from "./Debug.js";
import { STRINGS } from "./Strings.js";

import { RadarChart } from "./RadarChart.js";
import { DTTable } from "./DTTable.js";
import { LLPerson } from "./Person.js";
        
/** @class */
export class PRGMediator {
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
        this.theTable = new DTTable(tableId, tableData, this);
        
        // Columns holds the state of whether a particular dataset is visible or hidden.
        this.columnState = {};
        COMMON.llKeys.forEach(key => this.columnState[key] = true);
        let chartData = this._prepChartData(this.columnState, this.people);
        this.theChart = new RadarChart(graphId, chartData, { displayLegend: true, legendPosition: 'top' }, this);
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
        //        backgroundColor: COMMON.colors.background[nIndex],
        //        borderColor: COMMON.colors.solid[nIndex]
        //    }... ]
        //},
        DEBUG.logArgs('_prepChartData', arguments);
        let chartData = {
            labels: COMMON.llKeys.filter((key, index, array) => columnState[key]).map((key) => STRINGS.labels[key]),     
            datasets: people.map((person, index, array) => {
                let hue = (index * 137) % 360;
                return {
                    id: index,
                    label: person.fullName,
                    data: COMMON.llKeys.filter(key => columnState[key]).map(key => person[key]),
                    ids: COMMON.llKeys.filter(key => columnState[key]),
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
        DEBUG.log('Mediator._prepTableData(people)', arguments);

        let columns = COMMON.llKeys.map(key => { 
            return { 
                name: key, 
                data: key, 
                title: STRINGS.labels[key][0], 
                orderSequence: ['desc', 'asc'] 
            };
        });
        columns.unshift({ name: 'name', data: 'fullName', title: STRINGS.general.fullName }); 
        columns.unshift({ name: 'state', data: 'state', title: '' });
        columns.push({ 
            name: 'overallIntensity', 
            data: 'overallIntensity', 
            title: STRINGS.general.overallIntensityColumn, 
            orderSequence: ['desc', 'asc']
        });
        let tableData = {
            data: people,
            columns: columns
        };
        
        tableData.layout = {
            topStart: null,
            topEnd: {
                buttons: [
                    {
                        text: STRINGS.general.columnVisibility,
                        extend: 'colvis',
                        columns: 'th:nth-child(n+3)',
                        columnText: function (dt, nIndex, cTitle) {
                            if (nIndex == 9)
                                return STRINGS.general.overallIntensity;
                            if (nIndex > 1)
                                return STRINGS.labels[COMMON.llKeys[nIndex - 2]];
                            return cTitle;
                        }
                    }
                ]
            }
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
        DEBUG.logArgs('Mediator.tableSelectRow(aRows, bSelect)', arguments);
        
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
        DEBUG.logArgs('Mediator.tableHideColumn(key, bChecked)', arguments);
        
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
     * Update footer
     * @method
     * @param {array} data Array of the data in the table with each row containing an object with the key containing the datum.
     * @param {array} selectedRows Array containing true/false as to which of the rows are selected.
     * @param {array} visibleColumns Array containing true/false as to which of the columns are visible.
     * @public
     */
    tableUpdateFooter(data, selectedRows, visibleColumns) {
       DEBUG.log('Mediator.tableUpdateFooter(data, selectedRows, visibleColumns)', arguments);

        // Find the average values for each column.
        const aAverages = data.map(function (key, index) {
            if (visibleColumns[index] && index > 1) {
                // Data for selected rows
                const aValues = selectedRows.map(row => { 
                    return row[key];
                });
                return aValues.length > 0 ? (aValues.reduce((sum, val) => sum + val, 0) / aValues.length) : 0;
            } else 
                return undefined;   // Skip this column.
        });
        
        // Build the footer
        let arrows = [ 'bi-arrow-down', 'bi-arrow-down-right', 'bi-arrow-right', 'bi-arrow-up-right', 'bi-arrow-up' ];
        let cFooter = aAverages.reduce((accumulator, nAverage) => {
            if (nAverage == undefined)
                return accumulator;
            accumulator += '<th class="col-1 text-end">';
            if (nAverage > 0)
                accumulator += `<i class="bi ${arrows[COMMON.evaluateScoreLevel(nAverage)]} score-arrow"></i> ${Math.round(nAverage)}</th>`;
            return accumulator += '</th>';
        }, '<tr><th class="col-1"></th><th class="col-4">Group Average</th>');
        cFooter += '</tr>';
        
        return cFooter;
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