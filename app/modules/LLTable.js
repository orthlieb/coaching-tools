/*
 * @module modules/LLTable
 * @author Carl Orthlieb
 */
import { ERROR } from "./Error.js";
import { DEBUG } from "./Debug.js";
import { COMMON } from "./Common.js";
import { LLPerson } from "./Person.js";

import { STRINGS } from "./Strings.js";

/**
 * Class representing a Life Languages scores table for a group of people.
 * @class
 */
export class LLTable {
    /**
     * LLTable class constructor
     * @param {string} cTableId HTML ID of the table we are creating.
     * @param {array} data Data to display in the table. 
     * @param {object} [mediator=null] Mediator object that will catch events.
     * @param {boolean} [bColumnSelection=true] Allow the user to turn on/off columns 
     * @returns {object} Initialized LLTable object.
     * @constructor
     */
    constructor(cTableId, data, mediator = null, bColumnSelection = true) {
        DEBUG.logArgs('LLTable.constructor(cTableId, data)', arguments);
        this.mediator = mediator;
        this.cTableId = '#' + cTableId;
        let $table = $(this.cTableId);
        let that = this;
        
        let tableData = {
            columns: this._getColumns(),
            data: data,
            searching: false,
            paging: false,
            info: false,
            select: {
                style: 'multi',
                selector: 'td:first-child'
            },
            order: [[ 1, 'asc']],
            columnDefs: this._getColumnDefs(),
            layout: this._getLayout(bColumnSelection),
            footer: true,
            footerCallback: function updateFooter() { 
                that._updateFooter($table); 
            }.bind(that)
        };
        
        let dt = $table.DataTable(tableData);
        
        // Use rows().every() to loop through each row and select rows where state is true
        dt.rows().every(function(rowIdx, tableLoop, rowLoop) {
            var data = this.data(); // Get the row's data

            // Check if the 'state' property is true
            if (data.state === true) {
                this.select(); // Select the row
            }
        });
        
        this._addTooltips(dt);
        this._registerEvents($table, that);
        
        dt.draw();
    }
    
    /**
     * Add tooltips to the columns of the table.
     * @param {object} dt Data table object.
     * @private
     */
    _addTooltips(dt) {
        // Add tooltips to Life Language columns based on STRINGS.columnTitles, skipping the first two columns
        dt.columns().every(function(index) {
            if (index > 1) { // Skip the first two columns
                const headerCell = $(this.header()); // Get the header cell element
                headerCell.attr('data-bs-toggle', 'tooltip');
                headerCell.attr('title', STRINGS.columnTitles[index]);
            }
        });

        // Initialize Bootstrap tooltips with trigger set to 'hover' only
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.forEach(function(tooltipTriggerEl) {
            new bootstrap.Tooltip(tooltipTriggerEl, {
              trigger: 'hover' // Only show tooltip on hover, not focus
            });
        });
    }
    
    /**
     * Get the column definitions for the table.
     * @returns {array} Array containing column definitions.
     * @private
     */
    _getColumnDefs() {
       return [
            {   // Select checkbox.
                orderable: false,
                render: DataTable.render.select(),
                targets: 0,
                className: 'col-1'
            },
            {   // Full name
                targets: 1, 
                className: 'col-3', 
                asSorting: ['asc', 'desc'] 
            },
            {
                targets: [2, 3, 4, 5, 6, 7, 8, 9], // Life Language score columns
                className: 'col-1 text-end',
                asSorting: ['asc', 'desc'],
                render: function (data, type, row) {
                    if (type === 'display' || type === 'filter') {
                        return Math.round(data); // Round up for display and filtering
                    }
                    return data; // Return original value for sorting, etc.
                }
            }
        ];
    }

    /**
     * Get the column data for the table.
     * @returns {array} Array containing column data.
     * @private
     */
    _getColumns() {
        let columns = [
            { name: 'state', data: 'state', title: STRINGS.columnLabels[0] },
            { 
                name: 'name', 
                data: 'fullName', 
                title: STRINGS.columnLabels[1], 
                render: function (data, type, row) {
                    // Only render as a link if display is being requested
                    if (type === 'display') {
                        const url = `./PersonalBarChart.html?json=${encodeURIComponent(JSON.stringify(row))}`;
                        return `<a href="${url}" class="name-link">${data}</a>`;
                    }
                    return data;
                }
            }
        ];
        
        COMMON.llKeys.forEach((key, index) => {
            columns.push({ name: key, data: key, title: STRINGS.columnLabels[index + 2], orderSequence: ['desc', 'asc'] });
        });

        columns.push({
            name: "overallIntensity",
            data: "overallIntensity",
            title: STRINGS.columnLabels[9],
            orderSequence: ["desc", "asc"]
        });
        
        return columns;
    }
    
    /**
     * Get the layout for the table.
     * @param {boolean} bColumnSelection Determines whether to show the column selection drop down.
     * @returns {object} Defined layout.
     * @private
     */
    _getLayout(bColumnSelection) {
        if (!bColumnSelection) 
            return { topStart: null, topEnd: null };

        return {
                topStart: null,
                topEnd: {
                    buttons: [
                        {
                            text: STRINGS.general.columnVisibility,
                            extend: 'colvis',
                            columns: 'th:nth-child(n+3)',
                            columnText: function (dt, nIndex, cTitle) {
                                return STRINGS.columnTitles[nIndex];
                            }
                        }
                    ]
                }
            };
    }
    
    /**
     * Register for event handling for the table.
     * @param {object} $table The table jQuery object.
     * @param {object} that Object to bind to for callbacks.
     * @private
     */
    _registerEvents($table, that) {
        let dt = $table.DataTable();

        dt.on('column-visibility.dt', that._onColumnVisibility.bind(that));
        dt.on('order.dt', that._onSort.bind(that));
        dt.on('select.dt', that._onSelect.bind(that));
        dt.on('deselect.dt', that._onDeselect.bind(that));
        
        // Handle printing events.
        window.addEventListener("beforeprint", (event) => {
            $('div.dt-buttons').addClass("d-none");
        });
        window.addEventListener("afterprint", (event) => {
            $('div.dt-buttons').removeClass('d-none');
        });
    }
    
    /**
     * Called when column is made visible/invisible.
     * @param {object} e Event object.
     * @param {object} settings Datatable settings object.
     * @param {integer} nColumn Index of the column that is being hidden/shown.
     * @param {boolean} bVisible Column visibility state: false if column now hidden, or true if visible
     * @private
     */
    _onColumnVisibility(e, settings, nColumn, bState) {
        DEBUG.logArgs('table._onColumnVisibility(e, settings, nColumn, bState)', arguments);
        let $table = $(this.cTableId);
        let dt = $table.DataTable();
        
        this._updateFooter($table);

        if (this.mediator) {
            let columnName = dt.settings().init().columns[nColumn].data;
            this.mediator.tableHideColumn(columnName, bState); 
        }
    }
    
    /**
     * Called when the table is sorted. We want to draw a 50 score line on the appropriate row.
     * @param {object} event JQuery event object.
     * @param {object} settings DataTable settings object.
     * @param {array} aOrder Array of objects describing currently applied order
     * @private
     */
    _onSort(event, settings, aOrder) { 
        DEBUG.logArgs('table._onSort(event, settings, aOrder)', arguments);
        let $table = $(this.cTableId);
        let dt = $table.DataTable();

        // Remove previous 50 line
        $table.find('tbody tr').removeClass((index, className) => {
            return (className.match(/\b\w+-border-top\b/g) || []).join(' ');
        });
     
        let nSortIndex = aOrder[0].col;
        let cSortDir = aOrder[0].dir;

        // Sometimes the sort is indeterminate, don't know why. We also only want to do a 50 line when it is
        // on one of the Life Languages, not on checkbox (0) or name (1).
        if (nSortIndex !== null && nSortIndex > 1) {    
            // Columns can be hidden, even ones that were previously sorted on.
            // Make sure the column is visible.
            let nVisibleIndex = dt.column.index('fromData', nSortIndex);

            if (nVisibleIndex !== null) {
                let columnName = dt.settings().init().columns[nSortIndex].data;
                let bFlag = false;

                // Add new 50 line
                dt.rows().every(function (rowIdx, tableLoop, rowLoop) {
                    let rowData = this.data();
                    if (!bFlag && ((cSortDir == 'asc' && rowData[columnName] > 50) || (cSortDir == 'desc' && rowData[columnName] < 50))) {
                        bFlag = true;
                        $(this.node()).addClass(`${columnName}-border-top`);
                    }
                });            
            }
        }
    }
    
    /**
     * When checkbox is selected/unselected.
     * @param {object} e jQuery event object.
     * @param {object} dt DataTables API instance
     * @param {string} type Items being selected. This can be row, column or cell.
     * @param {array} aIndexes The DataTables' indexes of the selected items.
     * @private
     */
    _onDeselect(e, dxt, type, aIndexes) {
        DEBUG.logArgs('table._onDeselect(e, dt, type, aIndexes)', arguments);
        let $table = $(this.cTableId);
        let dt = $table.DataTable();
        
        // Array to hold the selected rows' data
        let aRows = [];

        // Iterate over the selected indexes
        aIndexes.forEach((index) => {
            // Get the data for the selected row
            let rowData = dt.row(index).data();

            // Add the row data to the array
            aRows.push(rowData);
        });
        
        if (this.mediator)
            this.mediator.tableSelectRow(aRows, false); 
        this._updateFooter($table);
        
        dt.draw(false);
    }
    
    /**
     * When checkbox is selected/unselected.
     * @param {object} e jQuery event object.
     * @param {object} dxt DataTables API instance
     * @param {string} type Items being selected. This can be row, column or cell.
     * @param {array} aIndexes The DataTables indexes of the selected items.
     * @private
     */
    _onSelect(e, dxt, type, aIndexes) {
        DEBUG.logArgs('table._onSelect(e, dt, type, aIndexes)', arguments);
        let $table = $(this.cTableId);
        let dt = $table.DataTable();
        
        // Array to hold the selected rows' data
        let aRows = [];

        // Iterate over the selected indexes
        aIndexes.forEach((index) => {
            // Get the data for the selected row
            let rowData = dt.row(index).data();

            // Add the row data to the array
            aRows.push(rowData);
        });
        
        if (this.mediator)
            this.mediator.tableSelectRow(aRows, true); 

        this._updateFooter($table);
        dt.draw(false);
    }

    /**
     * Update highlight in table based on sort. 
     * @param {object} JQuery object for the table.
     * @private
     */
    _updateColumnHighlight($table) {
        DEBUG.logArgs('table._updateColumnHighlight($table)', arguments);
        let dt = $table.DataTable();
        
        // Remove existing highlight
        $table.find('th').removeClass(function (index, className) {
            return (className.match(/\b\w+-highlight\b/g) || []).join(' ');
        });
        $table.find('td').removeClass(function (index, className) {
            return (className.match(/\b\w+-highlight\b/g) || []).join(' ');
        });

        let order = dt.order();
        let nSortedIndex = order[0][0];
        let nVisibleIndex = dt.column.index('fromData', nSortedIndex);
        
        // Sorted column can be hidden in odd circumstances.
        if (nVisibleIndex !== null) {   
            // Add highlight to column
            let columnName = dt.settings().init().columns[nSortedIndex].data;

            let cHighlight = `${columnName}-highlight`;
            $table.find('thead th').eq(nVisibleIndex).addClass(cHighlight);
            $table.find('tfoot th').eq(nVisibleIndex).addClass(cHighlight);
            $table.find('tbody tr').each(function() {
                $(this).find('td').eq(nVisibleIndex).addClass(cHighlight);
            });
        }
    }
    
   /**
     * Update footer called on every draw event.
     * @param {object} data Full data array of the table. Note that this is in data index order. Use the display parameter for the current display order.
     * @private
     */
    _updateFooter($table) {
        DEBUG.logArgs('table._updateFooter($table)', arguments); 
        let dt = $table.DataTable();
        let selectedRows = dt.rows({ selected: true }).data();
        let visibleColumns = dt.columns().visible();

        let dialogs = [];
        let cFooter = '<tr>';
        cFooter += '<th class="col-1"></th>';
        cFooter += `<th class="col-4">${STRINGS.general.groupAverage}</th>`;

        let personKeys = [ ...COMMON.llKeys, 'overallIntensity' ];
        let personData = {};
        personKeys.forEach((key, nIndex) => {
            let aValues = selectedRows.map(row => row[key]);
            let nAverage = aValues.length > 0 ? (aValues.reduce((sum, val) => sum + val, 0) / aValues.length) : 0;
            personData[key] = nAverage;
        });
        personData.fullName = 'The Group';
        let person = new LLPerson(personData);
        
        // Format each column footer.
        personKeys.forEach((key, nIndex) => {
            if (visibleColumns[nIndex + 2]) { // We don't do hidden columns
                switch (key) {
                    default:
                        cFooter += '<th class="col-1 text-end">';
                        if (person[key] > 0) {
                            let nScoreLevel = LLPerson.evaluateScoreLevel(person[key]);
                            let cScoreLevelSymbol = LLPerson.scoreLevelArrows[nScoreLevel];
                            cFooter += `<a id= "footer-info-${nIndex}" href="#" data-bs-toggle="modal" data-bs-target="#modal-dialog"><i class="fa-solid ${cScoreLevelSymbol} score-arrow"></i></a> ${Math.round(person[key])}`; 

                            let levelInfo = STRINGS.llLevelInfo[key];
                            dialogs.push({ 
                                index: nIndex, 
                                title: `${levelInfo.name}: ${STRINGS.scoreLevelLabels[nScoreLevel]}`, 
                                body: `${levelInfo.pre}<br><br>${levelInfo.info[nScoreLevel]}<br><br>${levelInfo.post}` 
                            });
                        }
                        cFooter += '</th>';
                    break;
                }
            }
        });
        cFooter += '</tr>';
        $(dt.table().footer()).html(cFooter);   // Apply the footer to the table.
        
        // Now attach the dialogs
        dialogs.forEach(dialog => COMMON.createPopupDialog(`footer-info-${dialog.index}`, dialog.title, dialog.body));
        
        this._updateColumnHighlight($table);    }
    
    /**
     * Select or deselect the specified row in the table
     * @param {integer} nIndex Index of the row to hide.
     * @param {boolean} bSelect True to select the row, false to deselect it.
     * @public
     */
    selectRow(nIndex, bSelect) {
        DEBUG.logArgs('LLTable.selectRow(nIndex, bSelect)', arguments);
        let $table = $(this.cTableId);
        let dt = $table.DataTable();
        
        if (bSelect)
            dt.row(nIndex).select();
        else
            dt.row(nIndex).deselect();
    }
    
    /**
     * Hide a particular column in the table.
     * @param {integer} nIndex Index of the column to hide (zero-based).
     * @param {boolean} bHidden True to hide the column, false to show it.
     * @public
     */
    hideColumn(columnName, bHidden) {
        DEBUG.logArgs('LLTable.hideColumn(columnName, bHidden)', arguments);
        let $table = $(this.cTableId);
        let dt = $table.DataTable();
        
        let column = dt.column(`${columnName}:name`);
        column.visible(!bHidden);
        dt.draw(false);

        this._updateColumnHighlight($table);
    }
}