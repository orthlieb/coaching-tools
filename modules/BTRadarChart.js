import { ERROR } from "./Error.js";
import { DEBUG } from "./Debug.js";

export class LLRadarChart {
    /**
     * Load data into an existing chart.
     * @param {array} data Array of datasets to be charted.
     * @param {array} columns Array of strings naming the keys, in order, to extract from each dataset.
     * @param {array} labels Array of strings to use as labels for each column.
      */
    loadData(data, columns, labels) {
        DEBUG.logArgs('LLRadarChart.loadData(data, columns, labels)', arguments);
        this.chart.data = data;
        this.chart.update();
    }
    
    /**
     * Radar chart based on Chart.js
     * @param {integer} id ID of the canvas element that will house the chart.
     * @param {array} data Array of datasets objects, each composed of key value pairs of data.
     * @param {array} columns Array of strings naming the keys, in order, to extract from each dataset.
     * @param {array} labels Array of strings to use as labels for each column.
     */
    constructor(id, chartData, chartOptions = { displayLegend: true, legendPosition: 'right' }) {
        DEBUG.logArgs('BTRadarChart.constructor(id, chartData, chartOptions)', arguments);
        const config = {
            type: "radar",
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                elements: { line: { borderWidth: 1 }},
                scales: { r: { beginAtZero: true, min: 0, max: 100, stepSize: 10 }},
                plugins: {
                    legend: {
                        display: chartOptions.displayLegend,
                        position: chartOptions.legendPosition,
                        onClick: this.onClickLegend
                    }
                }
            }
        }; 
        
        this.chart = new Chart(document.getElementById(id).getContext('2d'), config);
        this.chart.theChart = this;

        // Handle printing events.
        const mediaQuery = window.matchMedia('print');
        mediaQuery.addEventListener("change",() => chart.resize(parentContainer.clientHeight, parentContainer.clientWidth));
        //
        //
        //
        //window.addEventListener("beforeprint", (event) => {
        //    for (let id in Chart.instances) {
        //        let chart = Chart.instances[id];
        //        // 1101 and 75% is a complete hack for Letter size paper portrait orientation.
        //        Chart.getChart(chart).resize(1101, 75);
        //    }
        //});
        //window.addEventListener("afterprint", (event) => {
        //    for (let id in Chart.instances) {
        //        let chart = Chart.instances[id];
        //        chart.resize();
        //    }
        //});
    }
    
    onClickLegend(e, legendItem, legend) {
        DEBUG.logArgs('LLRadarChart.onClickLegend', arguments);
        
        var index = legendItem.datasetIndex;
        var meta = this.chart.getDatasetMeta(index);

        // Toggle visibility of the clicked dataset
        meta.hidden = meta.hidden === null ? !this.chart.data.datasets[index].hidden : null;
        // Update the chart
        this.chart.update();
        
        this.chart.theChart.mediator.onClickLegendGraph(legendItem.text, legendItem.hidden);
    }
    
    /**
     * Hides/shows a particular dataset.
     * @param {string} cLabel Label to hide (note cannot handle duplicate labels at this point in time)
     * @param {boolean} bHidden If true, hide this dataset, otherwise, show this dataset.
     */
    hideDataset(cLabel, bHidden) {
        // The row in the table and the dataset indx in the chart do not necessarily match.
        DEBUG.logArgs('LLRadarChart.hideDataset(cLabel, bHidden)', arguments);
        let nIndex = this.chart.data.datasets.findIndex(dataset => dataset.label === cLabel);
        DEBUG.log('Index in dataset is', nIndex);
        this.chart.data.datasets[nIndex].hidden = bHidden; 
        this.chart.update();
    }
    
    hideAll() {
        // The row in the table and the dataset indx in the chart do not necessarily match.
        this.chart.data.datasets.forEach(dataset => {  
            dataset.hidden = true; 
        });
        this.chart.update();
    }
    
    showAll() {
        // The row in the table and the dataset indx in the chart do not necessarily match.
        this.chart.data.datasets.forEach(dataset => {  
            dataset.hidden = false; 
        });
        this.chart.update();
    }
}        
        