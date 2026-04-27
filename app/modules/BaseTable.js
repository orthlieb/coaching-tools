/*
 * @module modules/BaseTable
 * @author Carl Orthlieb
 *
 * BaseTable owns everything LLTable and CITable used to duplicate: DataTables setup,
 * tooltip init, sort/select/deselect/column-visibility events, the "50 line" overlay,
 * the highlighted-column class, and the footer-redraw plumbing.
 *
 * Subclasses pass a `config` object that describes the four real differences:
 *   - which keys live in the table and how to read each row's value for a key
 *   - which STRINGS namespace provides the column labels/titles and the colvis button text
 *   - which page the "name" cell links to
 *   - how to render footer cells and what threshold to draw the "fluent" line at
 *
 * Adding a new table type is a ~50-line subclass.
 */

import { ERROR } from "./Error.js";
import { DEBUG } from "./Debug.js";
import { COMMON } from "./Common.js";
import { STRINGS } from "./Strings.js";

/** @class */
export class BaseTable {
    /**
     * @param {object} config Table configuration. See `_validateConfig` for the shape.
     * @param {string} cTableId HTML ID of the table (no `#`).
     * @param {array} data Row data (LLPerson instances).
     * @param {object} [mediator] Mediator that receives row-select / column-hide callbacks.
     * @param {boolean} [bColumnSelection] Show the colvis dropdown.
     */
    constructor(config, cTableId, data, mediator = null, bColumnSelection = true) {
        DEBUG.logArgs(`${this.constructor.name}.constructor(config, cTableId, data)`, arguments);
        this._validateConfig(config);
        this.config = config;
        this.mediator = mediator;
        this.cTableId = "#" + cTableId;

        const $table = $(this.cTableId);
        const that = this;

        const tableData = {
            columns: this._buildColumns(),
            data,
            searching: false,
            paging: false,
            info: false,
            select: { style: "multi", selector: "td:first-child" },
            order: [[1, "asc"]],
            columnDefs: this._buildColumnDefs(),
            layout: this._buildLayout(bColumnSelection),
            footer: true,
            footerCallback: () => that._updateFooter($table),
        };

        const dt = $table.DataTable(tableData);

        // Initial selection: rows whose `state` is true.
        dt.rows().every(function () {
            if (this.data().state === true) this.select();
        });

        this._addTooltips(dt);
        this._registerEvents($table);

        dt.draw();
    }

    /**
     * @param {object} c Configuration to validate.
     * @private
     */
    _validateConfig(c) {
        ERROR.assert(Array.isArray(c.keys) && c.keys.length > 0, "BaseTable config.keys must be a non-empty array");
        // columnLabels / columnTitles are arrays of strings (indexed by column position).
        ERROR.assert(Array.isArray(c.columnLabels), "BaseTable config.columnLabels must be an array");
        ERROR.assert(Array.isArray(c.columnTitles), "BaseTable config.columnTitles must be an array");
        ERROR.assertType(c.colvisButtonLabel, "string", "BaseTable config.colvisButtonLabel");
        ERROR.assertType(c.rowLinkBase, "string", "BaseTable config.rowLinkBase");
        ERROR.assertType(c.dataPathFor, "function", "BaseTable config.dataPathFor");
        ERROR.assertType(c.valueForKey, "function", "BaseTable config.valueForKey");
        ERROR.assertType(c.fluentThresholdFor, "function", "BaseTable config.fluentThresholdFor");
        ERROR.assertType(c.renderFooterCell, "function", "BaseTable config.renderFooterCell");
        ERROR.assertType(c.aggregate, "function", "BaseTable config.aggregate");
    }

    /**
     * Build the columns array. The first two columns (state checkbox + name) are
     * fixed; the rest come from `config.keys` with data paths from `config.dataPathFor`.
     * @returns {array}
     * @private
     */
    _buildColumns() {
        const c = this.config;
        const columns = [
            { name: "state", data: "state", title: c.columnLabels[0] },
            {
                name: "name",
                data: "fullName",
                title: c.columnLabels[1],
                render: (data, type, row) => {
                    if (type === "display") {
                        const url = `${c.rowLinkBase}?json=${encodeURIComponent(JSON.stringify(row))}`;
                        return `<a href="${url}" class="name-link">${data}</a>`;
                    }
                    return data;
                },
            },
        ];

        c.keys.forEach((key, index) => {
            columns.push({
                name: key,
                data: c.dataPathFor(key),
                title: c.columnLabels[index + 2],
                orderSequence: ["desc", "asc"],
            });
        });

        return columns;
    }

    /**
     * Default column defs: select checkbox, name, all numeric columns rendered with Math.round.
     * Subclasses can override `extraColumnDefs` to add per-column tweaks (e.g., Interactive Style).
     * @returns {array}
     * @private
     */
    _buildColumnDefs() {
        const c = this.config;
        const numericTargets = c.keys.map((_, i) => i + 2);
        const defs = [
            { orderable: false, render: DataTable.render.select(), targets: 0, className: "col-1" },
            { targets: 1, className: "col-2", asSorting: ["asc", "desc"] },
            {
                targets: numericTargets,
                className: "col-1 text-end",
                asSorting: ["asc", "desc"],
                render: (data, type) => (type === "display" || type === "filter" ? Math.round(data) : data),
            },
        ];
        if (typeof c.extraColumnDefs === "function") {
            return defs.concat(c.extraColumnDefs());
        }
        return defs;
    }

    /**
     * Layout for the table controls (just the colvis dropdown when enabled).
     * @param {boolean} bColumnSelection
     * @returns {object}
     * @private
     */
    _buildLayout(bColumnSelection) {
        if (!bColumnSelection) return { topStart: null, topEnd: null };

        const c = this.config;
        return {
            topStart: null,
            topEnd: {
                buttons: [
                    {
                        text: c.colvisButtonLabel,
                        extend: "colvis",
                        columns: "th:nth-child(n+3)",
                        columnText: (dt, nIndex) => c.columnTitles[nIndex],
                    },
                ],
            },
        };
    }

    /**
     * Add Bootstrap tooltips to the column headers (skipping checkbox + name).
     * @param {object} dt DataTable API instance.
     * @private
     */
    _addTooltips(dt) {
        const c = this.config;
        const $tableEl = $(dt.table().container());
        dt.columns().every(function (index) {
            if (index > 1) {
                $(this.header())
                    .attr("data-bs-toggle", "tooltip")
                    .attr("title", c.columnTitles[index]);
            }
        });
        // Scope tooltip init to this table so we don't double-init tooltips on the page.
        $tableEl.find('[data-bs-toggle="tooltip"]').each(function () {
            new bootstrap.Tooltip(this, { trigger: "hover" });
        });
    }

    /**
     * Wire up DataTable + window events.
     * @param {object} $table jQuery wrapper for the table.
     * @private
     */
    _registerEvents($table) {
        const dt = $table.DataTable();
        dt.on("column-visibility.dt", this._onColumnVisibility.bind(this));
        dt.on("order.dt", this._onSort.bind(this));
        dt.on("select.dt", this._onSelect.bind(this));
        dt.on("deselect.dt", this._onDeselect.bind(this));

        // Hide the colvis dropdown when printing (it's interactive UI, not data).
        window.addEventListener("beforeprint", () => $("div.dt-buttons").addClass("d-none"));
        window.addEventListener("afterprint", () => $("div.dt-buttons").removeClass("d-none"));
    }

    _onColumnVisibility(e, settings, nColumn, bState) {
        DEBUG.logArgs("BaseTable._onColumnVisibility", arguments);
        const $table = $(this.cTableId);
        const dt = $table.DataTable();
        this._updateFooter($table);
        if (this.mediator) {
            const columnName = dt.settings().init().columns[nColumn].name;
            this.mediator.tableHideColumn(columnName, bState);
        }
    }

    /**
     * Draw a "fluent" border above the first row whose value crosses the per-column threshold.
     * Threshold is 50 by default; CITable subclass overrides for Interactive Style (150).
     */
    _onSort(event, settings, aOrder) {
        DEBUG.logArgs("BaseTable._onSort", arguments);
        const $table = $(this.cTableId);
        const dt = $table.DataTable();
        const c = this.config;

        // Remove previous border-top markers.
        $table.find("tbody tr").removeClass((index, className) =>
            (className.match(/\b\w+-border-top\b/g) || []).join(" "),
        );

        // DataTables can fire `order.dt` with an empty array during init or column-visibility changes.
        if (!aOrder || aOrder.length === 0) return;

        const nSortIndex = aOrder[0].col;
        const cSortDir = aOrder[0].dir;

        // Only mark the line on numeric columns (skip checkbox=0 and name=1).
        if (!Number.isInteger(nSortIndex) || nSortIndex <= 1) return;

        const nVisibleIndex = dt.column.index("fromData", nSortIndex);
        if (nVisibleIndex === null) return;

        const columnName = dt.settings().init().columns[nSortIndex].name;
        const nThreshold = c.fluentThresholdFor(columnName);
        let bMarked = false;

        dt.rows().every(function () {
            if (bMarked) return;
            const nValue = c.valueForKey(this.data(), columnName);
            const crosses =
                (cSortDir === "asc" && nValue > nThreshold) ||
                (cSortDir === "desc" && nValue < nThreshold);
            if (crosses) {
                bMarked = true;
                $(this.node()).addClass(`${columnName}-border-top`);
            }
        });
    }

    _onSelect(e, dxt, type, aIndexes) {
        DEBUG.logArgs("BaseTable._onSelect", arguments);
        this._notifyMediatorOfSelection(aIndexes, true);
    }

    _onDeselect(e, dxt, type, aIndexes) {
        DEBUG.logArgs("BaseTable._onDeselect", arguments);
        this._notifyMediatorOfSelection(aIndexes, false);
    }

    /**
     * Common select/deselect handler — extracts row data, notifies mediator, redraws.
     * @private
     */
    _notifyMediatorOfSelection(aIndexes, bSelect) {
        const $table = $(this.cTableId);
        const dt = $table.DataTable();
        const aRows = aIndexes.map((index) => dt.row(index).data());
        if (this.mediator) this.mediator.tableSelectRow(aRows, bSelect);
        this._updateFooter($table);
        dt.draw(false);
    }

    /**
     * Refresh the highlight on the currently-sorted column. Re-applied after every footer redraw.
     * @private
     */
    _updateColumnHighlight($table) {
        DEBUG.logArgs("BaseTable._updateColumnHighlight", arguments);
        const dt = $table.DataTable();

        // Wipe existing highlight classes.
        $table.find("th, td").removeClass((index, className) =>
            (className.match(/\b\w+-highlight\b/g) || []).join(" "),
        );

        const order = dt.order();
        if (!order || order.length === 0) return;

        const nSortedIndex = order[0][0];
        const nVisibleIndex = dt.column.index("fromData", nSortedIndex);
        if (nVisibleIndex === null) return;

        const columnName = dt.settings().init().columns[nSortedIndex].name;
        if (!columnName) return;

        const cHighlight = `${columnName}-highlight`;
        $table.find("thead th").eq(nVisibleIndex).addClass(cHighlight);
        $table.find("tfoot th").eq(nVisibleIndex).addClass(cHighlight);
        $table.find("tbody tr td:nth-child(" + (nVisibleIndex + 1) + ")").addClass(cHighlight);
    }

    /**
     * Build the footer row and attach the popup dialogs that the cells reference.
     * Most of the work is delegated to `config.aggregate` (build a synthetic "group" object
     * from selected rows) and `config.renderFooterCell` (return cell HTML + dialog metadata).
     * @private
     */
    _updateFooter($table) {
        DEBUG.logArgs("BaseTable._updateFooter", arguments);
        const dt = $table.DataTable();
        const c = this.config;
        const selectedRows = dt.rows({ selected: true }).data();
        const visibleColumns = dt.columns().visible();

        const aggregate = c.aggregate(selectedRows);
        const dialogs = [];

        let cFooter = "<tr>";
        cFooter += '<th class="col-1"></th>';
        cFooter += `<th class="col-4">${STRINGS.general.groupAverage}</th>`;
        c.keys.forEach((key, nIndex) => {
            if (visibleColumns[nIndex + 2]) {
                cFooter += c.renderFooterCell({ key, nIndex, aggregate, dialogs });
            }
        });
        cFooter += "</tr>";

        $(dt.table().footer()).html(cFooter);

        // Attach popups to whatever the footer cells advertised.
        dialogs.forEach((d) => COMMON.createPopupDialog(`footer-info-${d.index}`, d.title, d.body));

        this._updateColumnHighlight($table);
    }

    /**
     * Select or deselect a row by index.
     */
    selectRow(nIndex, bSelect) {
        DEBUG.logArgs("BaseTable.selectRow", arguments);
        const dt = $(this.cTableId).DataTable();
        if (bSelect) dt.row(nIndex).select();
        else dt.row(nIndex).deselect();
    }

    /**
     * Hide or show a column by its `name` (the bare key, e.g. "mover" or "acceptanceLevel").
     */
    hideColumn(columnName, bHidden) {
        DEBUG.logArgs("BaseTable.hideColumn", arguments);
        const $table = $(this.cTableId);
        const dt = $table.DataTable();
        dt.column(`${columnName}:name`).visible(!bHidden);
        dt.draw(false);
        this._updateColumnHighlight($table);
    }
}
