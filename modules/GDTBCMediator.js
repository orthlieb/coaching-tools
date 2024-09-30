/*
 * @module modules/PDTRGMediator
 * @author Carl Orthlieb
 */

import { ERROR } from "./Error.js";
import { COMMON } from "./Common.js";
import { DEBUG } from "./Debug.js";

import { BarChart } from "./BarChart.js";
import { DTTable } from "./DTTable.js";
import { LLPerson } from "./Person.js";
        
/** @class */
export class GDTBCMediator {
    /**
     * Mediator for Datatables Group Barchart
     * @param {array} data Array of people objects (unvalidated).
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
        COMMON.keys.forEach(key => this.columnState[key] = true);
        let chartData = this._prepChartData(this.columnState, this.people);
        this.theChart = new BarChart(graphId, chartData, { displayLegend: false });
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
     * Get sorted scores for people
     * @method
     * @param {array} people An array of person objects.
     * @returns {array} Array of sorted objects, with key, min, avg, and max values for each Life Language.
     */
    _getSortedScores(people) {
        // Filter people with state true
        const activePeople = people.filter(person => person.state);

        // Calculate the min, max, and average values for each Life Language
        const scores = COMMON.keys.map(key => {
            const values = activePeople.map(person => person[key]);
            const min = Math.round(Math.min(...values));
            const max = Math.round(Math.max(...values));
            const avg = Math.round(values.reduce((sum, val) => sum + val, 0) / values.length);

            return { key, min, avg, max };
        });

        // Sort the scores in descending order by average score
        return scores.sort((a, b) => b.avg - a.avg);        
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
        DEBUG.logArgs('_prepChartData(columnState, people)', arguments);

        let scores = this._getSortedScores(people);
        let that = this;
        
        // Create datasets for the low to average and average to high values
        const minToAvgDataset = {
            label: 'Min to Avg',
            data: scores.map(item => [ item.min, item.avg ]),
            backgroundColor: scores.map(item => COMMON.colors.light[item.key]),
            borderColor: 'white',
            borderWidth: 1
        };

        const avgToMaxDataset = {
            label: 'Avg to Max',
            data: scores.map(item => item.max - item.avg), // Difference to stack on top
            backgroundColor: scores.map(item =>  COMMON.colors.light[item.key]),
            borderColor: 'white',
            borderWidth: 1
        };
        
        const chartData = {
            labels: scores.map(item => COMMON.labels[item.key]),
            datasets: [ minToAvgDataset, avgToMaxDataset ],
            annotations: this._prepAnnotationData(scores.map(item => item.avg)),
            tooltip: {
                callbacks: {
                    // Customize the tooltip label for each individual bar
                    label: function(tooltipItem) {
                        const scores = that._getSortedScores(people);
                        const dataIndex = tooltipItem.dataIndex;
                        
                        // Display the custom label with the value
                        return `Min: ${scores[dataIndex].min}\nAvg: ${scores[dataIndex].avg}\nMax: ${scores[dataIndex].max}`;
                    }
                }
            }
        };
        
        return chartData;        
    }
    
   /**
     * Prepare annotations for the chart.
     * @method
     * @param {array} scores Scores that will be displayed.
     * @returns {object} Prepared data for the annotations.
     * @private
     */
    _prepAnnotationData(scores) {
        DEBUG.logArgs('_prepAnnotationData(scores)', arguments);

        let yMin = Math.round(Math.min(scores[0], scores[scores.length - 1]));
        let yMax = Math.round(yMin + Math.abs(scores[0] - scores[scores.length - 1]));
        
        const annotationData = {
            // 50 line for the chart.
            line1: {
                type: 'line',
                yMin: 50,
                yMax: 50,
                borderColor: 'black',
                borderWidth: 1,
                label: {
                    content: '50',
                    enabled: true,
                    position: 'center'
                },
                drawTime: 'beforeDatasetsDraw'
            },
            // Range box
            box1: {
                // This will be the range as a gray box
                type: 'box',
                xMin: -0.5,
                xMax: 6.5,
                yMin: yMin,
                yMax: yMax,
                borderWidth: 0,
                backgroundColor: 'rgba(200, 200, 200, 0.5)',
                drawTime: 'beforeDatasetsDraw'
            },
            label1: {
                type: 'label',
                xValue: 50, // Adjust xValue to place it inside the box
                yValue: yMax - yMin + 12, // Adjust yValue to place it inside the box
                backgroundColor: 'rgba(0, 0, 0, 0.0)', // Transparent background
                color: 'white', // Label text color
                content: [`Range: ${yMax - yMin}`],
                font: {
                    size: 12,
                    weight: 'bold'
                },
                padding: 4,
                position: 'center',
                textAlign: 'center'
            }
        };   
        
        return annotationData;
    }

    /**
     * Prepare the data for use in the table.
     * @method
     * @param {array} people An array of person objects.
     * @returns {object} Prepared data for initializing and loading the table.
     * @private
     */
    _prepTableData(people) {
        let columns = COMMON.keys.map(key => { return { 
            name: key, 
            data: key, 
            title: COMMON.labels[key][0], 
            orderSequence: ['desc', 'asc'] }; });
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
        DEBUG.logArgs('PDTRGMediator.tableHideColumn(key, bChecked)', arguments);
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
    }
}