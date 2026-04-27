/*
 * @module modules/LLRGMediator
 * @author Carl Orthlieb
 *
 * Mediator for the Life Language Radar Graph (datasets are languages, axes are people).
 */

import { COMMON } from "./Common.js";
import { DEBUG } from "./Debug.js";
import { STRINGS } from "./Strings.js";

import { RadarChart } from "./RadarChart.js";
import { LLTable } from "./LLTable.js";
import { BaseMediator } from "./BaseMediator.js";

/** @class */
export class LLRGMediator extends BaseMediator {
    constructor(data, tableId, graphId) {
        // The original code did NOT initialize person.state for this mediator. Preserve that
        // behavior — LLPerson sets state=true by default in the constructor anyway.
        super(data, COMMON.llKeys, { applyDefaultPersonState: false });

        this.theTable = new LLTable(tableId, this.people, this, false);

        const chartData = this._prepChartData(this.columnState, this.people);
        this.theChart = new RadarChart(graphId, chartData, { displayLegend: true, legendPosition: "bottom" }, this);
    }

    /**
     * Datasets are LL keys; axes are active people.
     * @private
     */
    _prepChartData(columnState, people) {
        DEBUG.logArgs("LLRGMediator._prepChartData", arguments);
        const active = people.filter((person) => person.state);
        return {
            labels: active.map((person) => person.fullName),
            datasets: COMMON.llKeys.map((key) => ({
                label: STRINGS.labels[key],
                data: active.map((person) => person[key]),
                ids: active.map((person) => person.id),
                backgroundColor: COMMON.colors.background[key],
                borderColor: COMMON.colors.solid[key],
                fill: true,
                hidden: !columnState[key],
            })),
        };
    }

    tableSelectRow(aRows, bSelect) {
        DEBUG.logArgs("LLRGMediator.tableSelectRow", arguments);
        this._guarded(() => {
            aRows.forEach((row) => {
                const person = this.people.find((p) => p.id === row.id);
                person.state = bSelect;
            });
            // Axis change → full reload, not just a hide.
            this.theChart.loadData(this._prepChartData(this.columnState, this.people));
        });
    }

    graphClickLegend(nIndex, bHidden) {
        DEBUG.logArgs("LLRGMediator.graphClickLegend", arguments);
        this._guarded(() => {
            const key = COMMON.llKeys[nIndex];
            this.columnState[key] = !bHidden;
        });
    }

    tableHideColumn(key, bChecked) {
        DEBUG.logArgs("LLRGMediator.tableHideColumn", arguments);
        this._guarded(() => {
            this.columnState[key] = bChecked;
        });
    }
}
