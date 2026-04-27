/*
 * @module modules/LLTable
 * @author Carl Orthlieb
 *
 * Life Languages scores table for a group of people. All shared table behavior lives in BaseTable.
 */

import { BaseTable } from "./BaseTable.js";
import { COMMON } from "./Common.js";
import { STRINGS } from "./Strings.js";
import { LLPerson } from "./Person.js";

const KEYS = [...COMMON.llKeys, "overallIntensity"];

/**
 * Render a single footer cell for an LL key. Mutates `dialogs` to register a popup
 * the surrounding code will wire up.
 * @returns {string} cell HTML
 */
function renderFooterCell({ key, nIndex, aggregate: person, dialogs }) {
    let cell = '<th class="col-1 text-end">';
    if (person[key] > 0) {
        const nScoreLevel = LLPerson.evaluateScoreLevel(person[key]);
        const cScoreLevelSymbol = LLPerson.scoreLevelArrows[nScoreLevel];
        cell += `<a id="footer-info-${nIndex}" href="#" data-bs-toggle="modal" data-bs-target="#modal-dialog">`;
        cell += `<i class="fa-solid ${cScoreLevelSymbol} score-arrow"></i></a> ${Math.round(person[key])}`;

        const levelInfo = STRINGS.llLevelInfo[key];
        dialogs.push({
            index: nIndex,
            title: `${levelInfo.name}: ${STRINGS.scoreLevelLabels[nScoreLevel]}`,
            body: `${levelInfo.pre}<br><br>${levelInfo.info[nScoreLevel]}<br><br>${levelInfo.post}`,
        });
    }
    cell += "</th>";
    return cell;
}

/** @class */
export class LLTable extends BaseTable {
    constructor(cTableId, data, mediator = null, bColumnSelection = true) {
        super(
            {
                keys: KEYS,
                columnLabels: STRINGS.columnLabels,
                columnTitles: STRINGS.columnTitles,
                colvisButtonLabel: STRINGS.general.columnVisibility,
                rowLinkBase: "./PersonalBarChart.html",
                dataPathFor: (key) => key,                  // row.<key>
                valueForKey: (row, key) => row[key],
                fluentThresholdFor: () => 50,               // 50 line for every column
                aggregate: (selectedRows) => {
                    const personData = { fullName: "The Group" };
                    KEYS.forEach((key) => {
                        const aValues = selectedRows.map((row) => row[key]);
                        personData[key] = aValues.length
                            ? aValues.reduce((sum, val) => sum + val, 0) / aValues.length
                            : 0;
                    });
                    return new LLPerson(personData);
                },
                renderFooterCell,
            },
            cTableId,
            data,
            mediator,
            bColumnSelection,
        );
    }
}
