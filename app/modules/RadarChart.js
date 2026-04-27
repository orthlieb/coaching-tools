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
     * @param {object} chartData Chart.js data object containing labels and datasets.
     * @public
     */
    loadData(chartData) {
        DEBUG.logArgs('RadarChart.loadData(chartData)', arguments);
        this.chart.data = chartData;
        this.chart.update();
    }
    
    /**
     * Radar chart based on Chart.js
     * @param {string} id ID of the canvas element that will house the chart.
     * @param {object} chartData Chart.js data object containing labels and datasets.
     * @param {object} [chartOptions] Options for displaying the legend.
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
        mediaQuery.addEventListener('change', (event) => {
            if (event.matches) {
                this.chart.resize();  // Resize before printing
            } else {
                setTimeout(() => this.chart.resize(), 500); // Resize after printing
            }
        });
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
        