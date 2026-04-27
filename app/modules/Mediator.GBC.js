/*
 * @module modules/GBCMediator
 * @author Carl Orthlieb
 *
 * Mediator for the Group Bar Chart.
 */

import { COMMON } from "./Common.js";
import { DEBUG } from "./Debug.js";
import { STRINGS } from "./Strings.js";

import { BarChart } from "./BarChart.js";
import { LLTable } from "./LLTable.js";
import { LLPerson } from "./Person.js";
import { BaseMediator } from "./BaseMediator.js";
import { buildBarChartAnnotations } from "./ChartHelpers.js";

/** @class */
export class GBCMediator extends BaseMediator {
    /**
     * @param {array} data Array of people objects (unvalidated).
     * @param {string} tableId Id of the per-person table.
     * @param {string} tableIdLL Id of the group LL profile table.
     * @param {string} graphId Id of the canvas element for the chart.
     */
    constructor(data, tableId, tableIdLL, graphId) {
        super(data, COMMON.llKeys);

        this.theTable = new LLTable(tableId, this.people, this, false);
        this._loadProfileTable(this.people);

        const chartData = this._prepChartData(this.columnState, this.people);
        this.theChart = new BarChart(graphId, chartData, { displayLegend: false }, this);
    }

    /**
     * For each LL key, compute min/avg/max/stdDev/percentFluent across active people.
     * Also computes "gap" between successive avgs and the friendly rating + label.
     * @returns {Array<object>}
     * @private
     */
    _getSortedScores(people) {
        DEBUG.logArgs("GBCMediator._getSortedScores", arguments);

        const activePeople = people.filter((person) => person.state);
        const scores = COMMON.llKeys.map((key) => {
            const values = activePeople.map((person) => person[key]);
            const min = Math.round(Math.min(...values));
            const max = Math.round(Math.max(...values));
            const avg = Math.round(values.reduce((sum, val) => sum + val, 0) / values.length);
            const rating = STRINGS.scoreLevelLabels[LLPerson.evaluateScoreLevel(avg)];
            const languageLabel = STRINGS.labels[key];
            const percentFluent = values.length > 0
                ? values.reduce((nFluent, nScore) => (nScore >= 50 ? ++nFluent : nFluent), 0) / values.length
                : 0;

            // Standard deviation: 1 = concentrated, 0 = spread out.
            const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
            const stdDev = Math.round(Math.sqrt(variance));

            return { key, min, avg, max, stdDev, rating, languageLabel, percentFluent };
        });

        scores.sort((a, b) => b.avg - a.avg);

        // Walk through and tag each with gap-from-previous.
        let lastScore = 0;
        scores.forEach((score) => {
            score.gap = Math.max(lastScore - score.avg, 0);
            lastScore = score.avg;
        });

        return scores;
    }

    _prepChartData(columnState, people) {
        DEBUG.logArgs("GBCMediator._prepChartData", arguments);

        // Compute scores once and capture them in the tooltip closure.
        // Hover tooltips no longer trigger a recompute on every mouse move.
        const scores = this._getSortedScores(people);
        const tt = STRINGS.groupBarChart.tooltip;

        const minToAvgDataset = {
            label: "Min to Avg",
            data: scores.map((score) => [score.min, score.avg]),
            backgroundColor: scores.map((score) => COMMON.colors.solid[score.key]),
            borderColor: "white",
            borderWidth: 1,
        };
        const avgToMaxDataset = {
            label: "Avg to Max",
            data: scores.map((item) => item.max - item.avg),
            backgroundColor: scores.map((item) => COMMON.colors.solid[item.key]),
            borderColor: "white",
            borderWidth: 1,
        };

        return {
            labels: scores.map((item) => STRINGS.labels[item.key]),
            datasets: [minToAvgDataset, avgToMaxDataset],
            annotations: buildBarChartAnnotations(scores.map((item) => item.avg)),
            tooltip: {
                callbacks: {
                    label: (tooltipItem) => {
                        const s = scores[tooltipItem.dataIndex];
                        let cTip = `${tt.min} ${s.min}\n${tt.avg} ${s.avg}\n${tt.max} ${s.max}`;
                        cTip += `\n${tt.fluent} ${Math.round(s.percentFluent * 100)}%`;
                        return cTip;
                    },
                },
            },
        };
    }

    /**
     * Populate the LL profile table (group avg per language, plus range and overall intensity).
     * @private
     */
    _loadProfileTable(people) {
        DEBUG.logArgs("GBCMediator._loadProfileTable", arguments);
        const scores = this._getSortedScores(people);

        const table = document.getElementById("the-ll-table");
        const rows = table.getElementsByTagName("tbody")[0].getElementsByTagName("tr");
        [...rows].forEach((row, index) => {
            row.querySelector(".lllanguage").textContent = scores[index].languageLabel;
            row.querySelector(".llscore").textContent = scores[index].avg;
            row.querySelector(".llrating").textContent = scores[index].rating;

            if (index === 0) return; // Primary has no gap.

            let cGapSymbol = "";
            const tooltipSpan = document.getElementById(`gap-icon-${index}-tooltip`);
            tooltipSpan.setAttribute("title", STRINGS.general.moderate);

            if (scores[index].gap < 5) {
                cGapSymbol = '<i class="gap-compressed fa-solid fa-down-left-and-up-right-to-center fa-rotate-by" style="--fa-rotate-angle: 45deg;"></i>';
                COMMON.createPopupDialog(
                    `gap-icon-${index}`,
                    `${STRINGS.general.gap}: ${STRINGS.general.low}`,
                    `${STRINGS.gap.pre}<br><br>${STRINGS.gap.info[0]}<br><br>${STRINGS.gap.post}`,
                    cGapSymbol,
                );
                tooltipSpan.setAttribute("title", STRINGS.general.low);
            } else if (scores[index].gap > 10) {
                cGapSymbol = '<i class="gap-expanded fa-solid fa-arrow-up-right-and-arrow-down-left-from-center fa-rotate-by" style="--fa-rotate-angle: 135deg;"></i>';
                COMMON.createPopupDialog(
                    `gap-icon-${index}`,
                    `${STRINGS.general.gap}: ${STRINGS.general.high}`,
                    `${STRINGS.gap.pre}<br><br>${STRINGS.gap.info[2]}<br><br>${STRINGS.gap.post}`,
                    cGapSymbol,
                );
                tooltipSpan.setAttribute("title", STRINGS.general.high);
            }
            row.querySelector(`#gap-icon-${index}`).innerHTML = cGapSymbol;
            row.querySelector(`#gap-${index}`).innerHTML = scores[index].gap;
            new bootstrap.Tooltip(tooltipSpan);
        });

        // Footer: range + overall intensity.
        const activePeople = people.filter((person) => person.state);
        const nRange = Math.abs(scores[0].avg - scores[6].avg);
        const nRangeIndex = LLPerson.evaluateScoreLevel(nRange);
        const overallIntensity = Math.round(
            activePeople.reduce((sum, person) => sum + person.overallIntensity, 0) / activePeople.length,
        );
        const nRatingIndex = LLPerson.evaluateScoreLevel(overallIntensity);

        document.getElementById("llrange").textContent = nRange;
        COMMON.createPopupDialog(
            "llrange-info",
            `${STRINGS.general.range}: ${STRINGS.scoreLevelLabels[nRangeIndex]}`,
            `${STRINGS.range.pre}<br><br>${STRINGS.range.info[nRangeIndex]}<br><br>${STRINGS.range.post}`,
        );
        document.getElementById("lloi").textContent = overallIntensity;
        document.getElementById("lloirating").textContent = STRINGS.scoreLevelLabels[nRatingIndex];
        const oi = STRINGS.llLevelInfo.overallIntensity;
        COMMON.createPopupDialog(
            "lloi-info",
            `${oi.name}: ${STRINGS.scoreLevelLabels[nRatingIndex]}`,
            `${oi.pre}<br><br>${oi.info[nRatingIndex]}<br><br>${oi.post}`,
        );
    }

    /**
     * Table row select/deselect → update people state, redraw chart and table footer.
     * @public
     */
    tableSelectRow(aRows, bSelect) {
        DEBUG.logArgs("GBCMediator.tableSelectRow", arguments);
        this._guarded(() => {
            aRows.forEach((row) => {
                const person = this.people.find((p) => p.id === row.id);
                person.state = bSelect;
            });
            this._loadProfileTable(this.people);
            this.theChart.loadData(this._prepChartData(this.columnState, this.people));
        });
    }
}
