// @ts-check
/*
 * @module modules/PBCMediator
 * @author Carl Orthlieb
 *
 * Mediator for the Personal Bar Chart (single-person profile short form).
 */

import { COMMON } from "./Common.js";
import { DEBUG } from "./Debug.js";
import { STRINGS } from "./Strings.js";

import { BarChart } from "./BarChart.js";
import { LLPerson } from "./Person.js";
import { BaseMediator } from "./BaseMediator.js";
import { buildBarChartAnnotations } from "./ChartHelpers.js";

/** @class */
export class PBCMediator extends BaseMediator {
    /**
     * @param {object} data Person object (unvalidated).
     * @param {string} tableIdLL Id of the LL profile table element.
     * @param {string} graphId Id of the graph element.
     */
    constructor(data, tableIdLL, graphId) {
        DEBUG.logArgs("PBCMediator.constructor", arguments);
        super(data, COMMON.llKeys, { singlePerson: true });

        this._loadProfileTable(this.person);
        const chartData = this._prepChartData(this.columnState, this.person);
        this.theChart = new BarChart(graphId, chartData, { displayLegend: false }, this);
    }

    _prepChartData(columnState, person) {
        DEBUG.logArgs("PBCMediator._prepChartData", arguments);

        const scores = person.sortedScores.map((score) => ({
            ...score,
            color: COMMON.colors.solid[score.key],
        }));

        const dataset = {
            label: person.fullName,
            data: scores.map((score) => score.value),
            backgroundColor: scores.map((score) => score.color),
            borderColor: "white",
            borderWidth: 1,
        };

        return {
            labels: scores.map((score) => STRINGS.labels[score.key]),
            datasets: [dataset],
            annotations: buildBarChartAnnotations(scores.map((score) => score.value)),
        };
    }

    /**
     * Update the LL profile table with this person's scores, gap icons, and footer info.
     * @private
     */
    _loadProfileTable(person) {
        DEBUG.logArgs("PBCMediator._loadProfileTable", arguments);

        document.getElementById("fullname").textContent = person.fullName;
        if (person.companyName) {
            document.getElementById("companyname").textContent = person.companyName;
        }

        const table = document.getElementById("the-ll-table");
        const rows = table.getElementsByTagName("tbody")[0].getElementsByTagName("tr");
        [...rows].forEach((row, index) => {
            const score = person.sortedScores[index];
            row.querySelector(".lllanguage").textContent = STRINGS.labels[score.key];
            row.querySelector(".llscore").textContent = score.value;
            row.querySelector(".llrating").textContent = STRINGS.scoreLevelLabels[score.valueLevel];

            if (index === 0) return; // The primary doesn't have a gap.

            const cGapSymbol = [
                '<i class="gap-compressed fa-solid fa-down-left-and-up-right-to-center fa-rotate-by" style="--fa-rotate-angle: 45deg;"></i>',
                "",
                '<i class="gap-expanded fa-solid fa-up-right-and-down-left-from-center fa-rotate-by" style="--fa-rotate-angle: 135deg;"></i>',
            ];
            if (score.gapLevel !== 1) {
                COMMON.createPopupDialog(
                    `gap-icon-${index}`,
                    `${STRINGS.general.gap}: ${STRINGS.gapLevels[score.gapLevel]}`,
                    `${STRINGS.gap.pre}<br><br>${STRINGS.gap.info[score.gapLevel]}<br><br>${STRINGS.gap.post}`,
                    cGapSymbol[score.gapLevel],
                );
            }
            row.querySelector(`#gap-icon-${index}`).innerHTML = cGapSymbol[score.gapLevel];
            row.querySelector(`#gap-${index}`).innerHTML = String(Math.round(score.gap));
        });

        // Footer.
        document.getElementById("llrange").textContent = String(person.range);
        COMMON.createPopupDialog(
            "llrange-info",
            `${STRINGS.general.range}: ${STRINGS.scoreLevelLabels[person.rangeLevel]}`,
            `${STRINGS.range.pre}<br><br>${STRINGS.range.info[person.rangeLevel]}<br><br>${STRINGS.range.post}`,
        );
        document.getElementById("lloi").textContent = String(person.overallIntensity);
        document.getElementById("lloirating").textContent = STRINGS.scoreLevelLabels[person.overallIntensityLevel];
        const oi = STRINGS.llLevelInfo.overallIntensity;
        COMMON.createPopupDialog(
            "lloi-info",
            `${oi.name}: ${STRINGS.scoreLevelLabels[person.overallIntensityLevel]}`,
            `${oi.pre}<br><br>${oi.info[person.overallIntensityLevel]}<br><br>${oi.post}`,
        );
    }
}
