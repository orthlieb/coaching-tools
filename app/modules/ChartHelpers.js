// @ts-check
/*
 * @module modules/ChartHelpers
 * @author Carl Orthlieb
 *
 * Shared chart-data helpers used by multiple Mediators.
 */

import { DEBUG } from "./Debug.js";

/**
 * Build the annotation block (gray range box + 50-line) used by both the personal
 * and group bar charts. `scores` is assumed to be in ascending or descending order;
 * yMin/yMax are taken from the first and last scores.
 *
 * @param {number[]} scores
 * @returns {object} Chart.js annotation plugin config.
 */
export function buildBarChartAnnotations(scores) {
    DEBUG.logArgs("buildBarChartAnnotations(scores)", arguments);

    const first = scores[0];
    const last = scores[scores.length - 1];
    const yMin = Math.round(Math.min(first, last));
    const yMax = Math.round(yMin + Math.abs(first - last));

    return {
        // Gray box covering the range from min-of-extremes to max-of-extremes.
        box1: {
            type: "box",
            xMin: -0.5,
            xMax: 6.5,
            yMin,
            yMax,
            borderWidth: 0,
            backgroundColor: "lightgray",
            drawTime: "beforeDatasetsDraw",
        },
        // The "50" fluency line.
        line1: {
            type: "line",
            yMin: 50,
            yMax: 50,
            borderColor: "darkgray",
            borderWidth: 1,
            drawTime: "beforeDatasetsDraw",
        },
    };
}
