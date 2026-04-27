// @ts-check
/*
 * @module modules/CITable
 * @author Carl Orthlieb
 *
 * Communication Indicators table for a group of people. All shared table behavior lives in BaseTable.
 */

import { BaseTable } from "./BaseTable.js";
import { COMMON } from "./Common.js";
import { STRINGS } from "./Strings.js";
import { LLCommunicationIndicators } from "./Person.js";

const KEYS = [...COMMON.ciKeys];

/** Render a footer cell for one of the three learning preference columns. */
function renderLearningPrefFooterCell({ key, nIndex, ci, dialogs }) {
    let cell = '<th class="col-1 text-end">';
    if (ci[key] > 0) {
        const nScoreLevel = LLCommunicationIndicators.evaluateScoreLevel(ci[key]);
        const cScoreLevelSymbol = LLCommunicationIndicators.scoreLevelArrows[nScoreLevel];
        cell += `<a id="footer-info-${nIndex}" href="#" data-bs-toggle="modal" data-bs-target="#modal-dialog">`;
        cell += `<i class="fa-solid ${cScoreLevelSymbol} score-arrow"></i></a> ${Math.round(ci[key])}`;

        const levelInfo = STRINGS.ciLevelInfo.learningPreference;
        const aDominant = ci.preferredLearningStyle;
        let cDominant = "";
        if (aDominant.indexOf(key) !== -1) {
            cDominant = aDominant.length > 1 ? levelInfo.tied : levelInfo.dominant;
        }
        dialogs.push({
            index: nIndex,
            title: `${STRINGS.ciLabels[key]}: ${STRINGS.ciLevels[nScoreLevel]} ${cDominant}`,
            body: `${levelInfo.pre}<br><br>${levelInfo.info[key]}<br><br>${levelInfo.post}`,
        });
    }
    cell += "</th>";
    return cell;
}

/** Render the Interactive Style footer cell (it's the special-case one). */
function renderInteractiveStyleFooterCell({ key, nIndex, ci, dialogs }) {
    let cell = '<th class="col-1 text-end">';
    if (ci[key] > 0) {
        const is = LLCommunicationIndicators.composeInteractiveStyle(ci[key]);
        cell += `<a id="footer-info-${nIndex}" href="#" data-bs-toggle="modal" data-bs-target="#modal-dialog">`;
        cell += `${Math.round(is[0])} ${is[1]}</a>`;

        const nISIndex = is[1] === "I" ? 0 : is[1] === "B" ? 1 : 2;
        const cISName = STRINGS.ciInteractiveStyleNames[is[1]];
        const levelInfo = STRINGS.ciLevelInfo[key];
        dialogs.push({
            index: nIndex,
            title: `${levelInfo.name}: ${cISName}`,
            body: `${levelInfo.pre}<br><br>${levelInfo.info[nISIndex]}<br><br>${levelInfo.post}`,
        });
    }
    cell += "</th>";
    return cell;
}

/** Default footer cell renderer for plain CI columns (acceptanceLevel, internalControl, etc). */
function renderDefaultFooterCell({ key, nIndex, ci, dialogs }) {
    let cell = '<th class="col-1 text-end">';
    if (ci[key] > 0) {
        const nScoreLevel = LLCommunicationIndicators.evaluateScoreLevel(ci[key]);
        const cScoreLevelSymbol = LLCommunicationIndicators.scoreLevelArrows[nScoreLevel];
        cell += `<a id="footer-info-${nIndex}" href="#" data-bs-toggle="modal" data-bs-target="#modal-dialog">`;
        cell += `<i class="fa-solid ${cScoreLevelSymbol} score-arrow"></i></a> ${Math.round(ci[key])}`;

        const levelInfo = STRINGS.ciLevelInfo[key];
        dialogs.push({
            index: nIndex,
            title: `${levelInfo.name}: ${STRINGS.ciLevels[nScoreLevel]}`,
            body: `${levelInfo.pre}<br><br>${levelInfo.info[nScoreLevel]}<br><br>${levelInfo.post}`,
        });
    }
    cell += "</th>";
    return cell;
}

const LEARNING_PREF_KEYS = new Set([
    "learningPreferenceAuditory",
    "learningPreferenceVisual",
    "learningPreferencePhysical",
]);

function renderFooterCell({ key, nIndex, aggregate: ci, dialogs }) {
    if (key === "interactiveStyle") return renderInteractiveStyleFooterCell({ key, nIndex, ci, dialogs });
    if (LEARNING_PREF_KEYS.has(key)) return renderLearningPrefFooterCell({ key, nIndex, ci, dialogs });
    return renderDefaultFooterCell({ key, nIndex, ci, dialogs });
}

/** Per-table column-def overrides — Interactive Style needs its own renderer. */
function extraColumnDefs() {
    const isIndex = COMMON.ciKeys.indexOf("interactiveStyle") + 2; // +2 for state + name columns
    return [
        {
            targets: isIndex,
            className: "col-1 text-end",
            asSorting: ["asc", "desc"],
            render: (data, type) => {
                if (type === "display" || type === "filter") {
                    const is = LLCommunicationIndicators.composeInteractiveStyle(data);
                    return `${Math.round(is[0])} ${is[1]}`;
                }
                return data;
            },
        },
    ];
}

/** @class */
export class CITable extends BaseTable {
    constructor(cTableId, data, mediator = null, bColumnSelection = true) {
        super(
            {
                keys: KEYS,
                columnLabels: STRINGS.columnCILabels,
                columnTitles: STRINGS.columnCITitles,
                colvisButtonLabel: STRINGS.general.communicationIndicators,
                rowLinkBase: "./CommunicationIndicators.html",
                dataPathFor: (key) => `ci.${key}`,                       // row.ci.<key>
                valueForKey: (row, key) => row.ci[key],
                fluentThresholdFor: (key) => (key === "interactiveStyle" ? 150 : 50),
                aggregate: (selectedRows) => {
                    const ciData = {};
                    KEYS.forEach((key) => {
                        const aValues = selectedRows.map((row) => row.ci[key]);
                        ciData[key] = aValues.length
                            ? aValues.reduce((sum, val) => sum + val, 0) / aValues.length
                            : 0;
                    });
                    return new LLCommunicationIndicators(ciData);
                },
                renderFooterCell,
                extraColumnDefs,
            },
            cTableId,
            data,
            mediator,
            bColumnSelection,
        );
    }
}
