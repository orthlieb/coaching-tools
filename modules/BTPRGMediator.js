import { ERROR } from "./Error.js";
import { LLKEYS, LLLABELS, LLCOLORS, LLCOLORS_LIGHT } from "./Common.js";
import { DEBUG } from "./Debug.js";

import { LLRadarChart } from "./BTRadarChart.js";
import { LLTable } from "./BTTable.js";
import { LLPerson } from "./Person.js";
        
export class LLMediator {
    /**
     * Mediator for Bootstrap Table People Radar Graph
     * @param {array} data Array of people object (unvalidated)
     * @param {string} tableId Id of the table element to use.
     * @param {string} graphId Id of the graph element to use.
     * @returns Mediator object
     */
    constructor(data, tableId, graphId) {
        this.people = this._validateData(data);
           
        let companyName = this.people[0].companyName;
        if (companyName)
            $('.companyname').html(companyName).removeClass('d-none');
        
        this.theTable = new LLTable(tableId, this.people);
        this.theTable.mediator = this;

        // Columns holds the state of whether a particular language is visible or hidden.
        this.columnState = {};
        LLKEYS.forEach(key => this.columnState[key] = true);
        let chartData = this._prepChartData(this.columnState, this.people);
        this.theChart = new LLRadarChart(graphId, chartData);
        this.theChart.mediator = this;
    }
    
    /**
     * Validate the data passed into us.
     * @param {array} data Array of people objects containing Life Language info.
     * Will throw if there is invalid data.
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
     * @param {object} columnState A set of key value pairs indicating which columns are shown.
     * @param {array} people An array of person objects.
     * @returns {object} Prepared data for addition for initializing and loading the chart.
     */
    _prepChartData(columnState, people) {
        //data: {
        //    labels: ['Mover'', ...],
        //    datasets: [{
        //        label: 'Person 1',
        //        data: [65, 59, 90, 81, 56, 55, 33], Life Language scores
        //        backgroundColor: unique per person,
        //        borderColor: unique per person
        //    }... ]
        //}
        let chartData = {
            labels: LLKEYS.filter(key => columnState[key]).map(key => LLLABELS[key]),     
            datasets: []
        };
        
        let nIndex = 0;
        people.forEach((person) => {
            let hue = (nIndex++ * 137) % 360;
            
            chartData.datasets.push({
                label: person.fullName,
                data: LLKEYS.filter(key => columnState[key]).map(key => person[key]),
                backgroundColor: `hsla(${hue}, 70%, 50%, 25%)`, 
                borderColor: `hsl(${hue}, 70%, 50%)`,
                fill: true,
                hidden: !person.state
            });
        });
            
        return chartData;        
    }

    /**
     * Event listener when one of the rows in the table is selected.
     * @param {object} row Which row was selected.
     */
    onCheckTable(row) {
        DEBUG.logArgs('LLMediator.onCheckTable(row)', arguments);
        const person = this.people.find(person => person.fullName === row.fullName);
        person.state = true;

        // Because we are affecting a dataset in the chart we can use the built-in hideDataset instead of reloading.
        this.theChart.hideDataset(person.fullName, false);
     }
        
    /**
     * Event listener when one of the rows in the table is unselected.
     * @param {object} row Which row was selected.
     */
    onUncheckTable(row) {
        DEBUG.logArgs('LLMediator.onCheckTable(row)', arguments);
        const person = this.people.find(person => person.fullName === row.fullName);
        person.state = true;

        // Because we are affecting a dataset in the chart we can use the built-in hideDataset instead of reloading.
        this.theChart.hideDataset(person.fullName, true);   
    }
        
    /**
     * Event listener when the check all box is selected in the table.
     */
    onCheckAllTable() {
        DEBUG.log('LLMediator.onCheckAllTable');
        this.people.forEach(person => person.state = true);
        this.theChart.showAll();
    }
        
    /**
     * Event listener when the check all box is unselected in the table.
     */
    onUncheckAllTable() {
        DEBUG.log('MedLLMediatoriator.onUncheckAllTable');
        this.people.forEach(person => person.state = false);
        this.theChart.hideAll();  
    }
    
    /**
     * Event listener when an entry in the chart legend is clicked.
     * @param {string} cLabel Label of the item clicked
     * @param {boolean} bChecked Should the entry be hidden or not.
     */
    onClickLegendGraph(cLabel, bChecked) {
        DEBUG.logArgs('LLMediator.onClickLegendGraph', arguments);
        const person = this.people.find(person => person.fullName === cLabel);
        person.state = true;
        this.theTable.hideRow(cLabel, !bChecked);
    }
    
    /**
     * Event listener when a column is hidden/shown in the table.
     * @param {string} field Column that was selected (key not label).
     * @param {boolean} bChecked Should the column be shown or not.
     */
    onColumnSwitchTable(field, bChecked) {
        DEBUG.logArgs('LLMediator.onColumnSwitchTable(field, bChecked)', arguments);

        this.columnState[field] = bChecked;
 
        // Because we are affecting an axis of the chart, we have to reload it.
        let chartData = this._prepChartData(this.columnState, this.people);
        this.theChart.loadData(chartData);
    }
     
    //tableColumnSelect:
    //tableColumnUnselect:
    //tableDrawLine:
    //graphSelect:
    //graphUnselect:
}