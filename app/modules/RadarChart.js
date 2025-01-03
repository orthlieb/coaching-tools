/*
 * @module modules/RadarChart
 * @author Carl Orthlieb
 */

import { ERROR } from "./Error.js";
import { DEBUG } from "./Debug.js";

/** @class */
export class RadarChart {
    /**
     * Load data into an existing chart.
     * @param {array} data Array of datasets to be charted.
     * @param {array} columns Array of strings naming the keys, in order, to extract from each dataset.
     * @param {array} labels Array of strings to use as labels for each column.
     * @public
     */
    loadData(data, columns, labels) {
        DEBUG.logArgs('RadarChart.loadData(data, columns, labels)', arguments);
        this.chart.data = data;
        this.chart.update();
    }
    
    /**
     * Radar chart based on Chart.js
     * @param {integer} id ID of the canvas element that will house the chart.
     * @param {array} data Array of datasets objects, each composed of key value pairs of data.
     * @param {array} columns Array of strings naming the keys, in order, to extract from each dataset.
     * @param {array} labels Array of strings to use as labels for each column.
     * @param {object} [mediator] Mediator object to handle events. Default is null.
     * @constructor
     */
    constructor(id, chartData, chartOptions = { displayLegend: true, legendPosition: 'right' }, mediator = null) {
        DEBUG.logArgs('RadarChart.constructor(id, chartData, chartOptions)', arguments);
        this.mediator = mediator;
        
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
                        onClick: this._onClickLegend.bind(this)
                    }
                },
                animation: {
                    duration: 1000, // Animation duration in milliseconds
                    easing: 'easeOutElastic', // Easing function for the animation
                },

            }
        }; 
        
        this.chart = new Chart(document.getElementById(id).getContext('2d'), config);

        // Handle printing events.
        const mediaQuery = window.matchMedia('print');
        mediaQuery.addEventListener('change', () => chart.resize(parentContainer.clientHeight, parentContainer.clientWidth));
      }
    
    /**
     * Event handleer when legend entry is clicked
     * @param {object} e Event object.
     * @param {object} legendItem Object describing which legend item is clicked.
     * @param {object} legend Legend object.
     * @private
     */
    _onClickLegend(e, legendItem, legend) {
        DEBUG.logArgs('RadarChart._onClickLegend(e, legendItem, legend)', arguments);
        
        var index = legendItem.datasetIndex;

        // Toggle visibility of the clicked dataset
        let meta = this.chart.getDatasetMeta(index);
        meta.hidden = meta.hidden === null ? !legendItem.hidden : null;
        // Update the chart
        this.chart.update();
        
        this.mediator.graphClickLegend(legendItem.datasetIndex, !legendItem.hidden);
    }
    
    /**
     * Hides/shows a particular dataset.
     * @param {integer} index Index of the dataset to hide.
     * @param {boolean} bHidden If true, hide this dataset, otherwise, show this dataset.
     * @public
     */
    hideDataset(nIndex, bHidden) {
        DEBUG.logArgs('RadarChart.hideDataset(nIndex, bHidden)', arguments);
        this.chart.setDatasetVisibility(nIndex, !bHidden);  // `false` hides the dataset
        this.chart.update();
    }
}        
        