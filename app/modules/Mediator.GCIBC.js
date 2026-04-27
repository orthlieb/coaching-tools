/*
 * @module modules/GCIBCMediator
 * @author Carl Orthlieb
 *
 * Mediator for the Group Communication Indicators Bar Chart.
 */

import { COMMON } from "./Common.js";
import { DEBUG } from "./Debug.js";
import { STRINGS } from "./Strings.js";

import { BarChart } from "./BarChart.js";
import { CITable } from "./CITable.js";
import { LLCommunicationIndicators } from "./Person.js";
import { BaseMediator } from "./BaseMediator.js";

/** @class */
export class GCIBCMediator extends BaseMediator {
    constructor(data, tableId, graphId) {
        super(data, COMMON.ciKeys);
        this.theTable = new CITable(tableId, this.people, this, false);

        const chartData = this._prepChartData(this.columnState, this.people);
        this.theChart = new BarChart(graphId, chartData, { displayLegend: false }, this);
    }

    /**
     * Min / avg / max per CI key, with Interactive Style normalized to a 0-100 band so
     * it sits on the same axis as the other indicators.
     * @private
     */
    _getCIScores(people) {
        DEBUG.logArgs("GCIBCMediator._getCIScores", arguments);
        const activePeople = people.filter((person) => person.state);
        return COMMON.ciKeys.map((key) => {
            const nScale = key === "interactiveStyle" ? 3 : 1;
            const values = activePeople.map((person) => person.ci[key]);
            const min = Math.min(...values) / nScale;
            const max = Math.max(...values) / nScale;
            const avg = values.reduce((sum, val) => sum + val, 0) / values.length / nScale;
            return { key, min, avg, max };
        });
    }

    _prepChartData(columnState, people) {
        DEBUG.logArgs("GCIBCMediator._prepChartData", arguments);
        const scores = this._getCIScores(people);
        const tt = STRINGS.groupBarChart.tooltip;

        const minToAvgDataset = {
            label: "Min to Avg",
            data: scores.map((score) => [Math.round(score.min), Math.round(score.avg)]),
            backgroundColor: scores.map((score) => COMMON.ciColors.solid[score.key]),
            borderColor: "white",
            borderWidth: 1,
        };
        const avgToMaxDataset = {
            label: "Avg to Max",
            data: scores.map((item) => Math.round(item.max - item.avg)),
            backgroundColor: scores.map((score) => COMMON.ciColors.solid[score.key]),
            borderColor: "white",
            borderWidth: 1,
        };

        return {
            labels: scores.map((item) => STRINGS.ciLabels[item.key]),
            datasets: [minToAvgDataset, avgToMaxDataset],
            tooltip: {
                callbacks: {
                    label: (tooltipItem) => {
                        const dataIndex = tooltipItem.dataIndex;
                        const s = scores[dataIndex];

                        // Interactive Style is a normalized 0-100 band that we de-normalize for display.
                        if (dataIndex === 1) {
                            const min = LLCommunicationIndicators.composeInteractiveStyle(s.min * 3);
                            const avg = LLCommunicationIndicators.composeInteractiveStyle(s.avg * 3);
                            const max = LLCommunicationIndicators.composeInteractiveStyle(s.max * 3);
                            return `${tt.min} ${Math.round(min[0])} ${min[1]} ${tt.avg} ${Math.round(avg[0])} ${avg[1]} ${tt.max} ${Math.round(max[0])} ${max[1]} `;
                        }
                        return `${tt.min} ${Math.round(s.min)} ${tt.avg} ${Math.round(s.avg)} ${tt.max} ${Math.round(s.max)}`;
                    },
                },
            },
        };
    }

    tableSelectRow(aRows, bSelect) {
        DEBUG.logArgs("GCIBCMediator.tableSelectRow", arguments);
        this._guarded(() => {
            aRows.forEach((row) => {
                const person = this.people.find((p) => p.id === row.id);
                person.state = bSelect;
            });
            this.theChart.loadData(this._prepChartData(this.columnState, this.people));
        });
    }
}
