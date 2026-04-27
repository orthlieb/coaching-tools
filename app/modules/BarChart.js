// @ts-check
/*
 * @module modules/BarChart
 * @author Carl Orthlieb
 */

import { ERROR } from "./Error.js";
import { DEBUG } from "./Debug.js";

/** @class */
export class BarChart {
    /**
     * Load data into an existing chart.
     * @param {object} chartData Chart.js data object containing labels, datasets, annotations, and tooltip.
     * @public
     */
    loadData(chartData) {
        DEBUG.logArgs('BarChart.loadData(chartData)', arguments);
        this.chart.data = chartData;
        this.chart.options.plugins.annotation.annotations = chartData.annotations;
        this.chart.update();
    }

    /**
     * Bar chart based on Chart.js
     * @param {string} id ID of the canvas element that will house the chart.
     * @param {object} chartData Chart.js data object — has labels, datasets, annotations, tooltip.
     * @param {object} [chartOptions] Set of options for displaying legend and where.
     * @param {object} [mediator] Mediator object to handle events. Default is null.
     * @constructor
     */
    constructor(id, chartData, chartOptions = { displayLegend: true, legendPosition: 'right' }, mediator = null) {
        DEBUG.logArgs('BarChart.constructor(id, chartData, chartOptions)', arguments);
        this.mediator = mediator;

        // Configuration for the chart
        const config = {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        stacked: true
                    },
                    y: {
                        stacked: true,
                        max: 100,
                        ticks: {
                            stepSize: 10 // Display values in increments of 10
                        }
                    }
                },
                plugins: {
                    tooltip: chartData.tooltip,
                    annotation: {
                        annotations: chartData.annotations
                    },
                    legend: {
                        display: chartOptions.displayLegend,
                        position: chartOptions.legendPosition,
                        onClick: this._onClickLegend
                    }
                },
                animation: {
                    duration: 1000, // Animation duration in milliseconds
                    easing: 'easeOutElastic', // Easing function for the animation
                }
            }
        };
        
        const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById(id));
        this.chart = new Chart(canvas.getContext('2d'), config);
        this.chart.theChart = this;

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
     * Event handler when legend entry is clicked
     * @param {object} e Event object.
     * @param {object} legendItem Object describing which legend item is clicked.
     * @param {object} legend Legend object.
     * @private
     */
    _onClickLegend(e, legendItem, legend) {
        DEBUG.logArgs('BarChart._onClickLegend(e, legendItem, legend)', arguments);
        
        var index = legendItem.datasetIndex;

        // Toggle visibility of the clicked dataset
        let meta = this.chart.getDatasetMeta(index);
        meta.hidden = meta.hidden === null ? !legendItem.hidden : null;
        // Update the chart
        this.chart.update();
        
        this.chart.theChart.mediator.graphClickLegend(legendItem.datasetIndex, !legendItem.hidden);
    }
    
    /**
     * Hides/shows a particular dataset.
     * @param {number} nIndex Index of the dataset to hide.
     * @param {boolean} bHidden If true, hide this dataset, otherwise, show this dataset.
     * @public
     */
    hideDataset(nIndex, bHidden) {
        DEBUG.logArgs('BarChart.hideDataset(nIndex, bHidden)', arguments);
        DEBUG.log(`Current visibility of dataset ${nIndex}:`, this.chart.isDatasetVisible(nIndex));

        this.chart.setDatasetVisibility(nIndex, !bHidden);  // `false` hides the dataset
        this.chart.update();
    }
}        
        