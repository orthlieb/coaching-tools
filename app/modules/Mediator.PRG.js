/*
 * @module modules/PRGMediator
 * @author Carl Orthlieb
 *
 * Mediator for the People Radar Graph (datasets are people, axes are languages).
 */

import { COMMON } from "./Common.js";
import { DEBUG } from "./Debug.js";
import { STRINGS } from "./Strings.js";

import { RadarChart } from "./RadarChart.js";
import { LLTable } from "./LLTable.js";
import { BaseMediator } from "./BaseMediator.js";

/** @class */
export class PRGMediator extends BaseMediator {
    constructor(data, tableId, graphId) {
        super(data, COMMON.llKeys);

        this.theTable = new LLTable(tableId, this.people, this, false);

        const chartData = this._prepChartData(this.columnState, this.people);
        this.theChart = new RadarChart(graphId, chartData, { displayLegend: true, legendPosition: "bottom" }, this);
    }

    /**
     * Datasets are people; axes are LL keys. Each person gets a deterministic hue
     * derived from their index for visual stability across redraws.
     * @private
     */
    _prepChartData(columnState, people) {
        DEBUG.logArgs("PRGMediator._prepChartData", arguments);
        const visibleKeys = COMMON.llKeys.filter((key) => columnState[key]);
        return {
            labels: visibleKeys.map((key) => STRINGS.labels[key]),
            datasets: people.map((person, index) => {
                const hue = (index * 137) % 360;
                return {
                    id: index,
                    label: person.fullName,
                    data: visibleKeys.map((key) => person[key]),
                    ids: visibleKeys,
                    backgroundColor: `hsla(${hue}, 70%, 50%, 25%)`,
                    borderColor: `hsl(${hue}, 70%, 50%)`,
                    fill: true,
                    hidden: !person.state,
                };
            }),
        };
    }

    tableSelectRow(aRows, bSelect) {
        DEBUG.logArgs("PRGMediator.tableSelectRow", arguments);
        this._guarded(() => {
            aRows.forEach((row) => {
                const person = this.people.find((p) => p.id === row.id);
                person.state = bSelect;
                this.theChart.hideDataset(row.id, !bSelect);
            });
        });
    }

    tableHideColumn(key, bChecked) {
        DEBUG.logArgs("PRGMediator.tableHideColumn", arguments);
        this._guarded(() => {
            // Axis change → full reload.
            this.columnState[key] = bChecked;
            this.theChart.loadData(this._prepChartData(this.columnState, this.people));
        });
    }

    graphClickLegend(nIndex, bHidden) {
        DEBUG.logArgs("PRGMediator.graphClickLegend", arguments);
        // nIndex is the person id.
        this._guarded(() => {
            const person = this.people.find((p) => p.id === nIndex);
            person.state = !bHidden;
            this.theTable.selectRow(nIndex, !bHidden);
        });
    }
}
