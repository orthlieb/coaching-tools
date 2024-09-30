/*
 * @module modules/DTTable
 * @author Carl Orthlieb
 */
import { ERROR } from "./Error.js";
import { DEBUG } from "./Debug.js";
import { COMMON, LLKEYS, LLLABELS, LLCOLORS_BACKGROUND } from "./Common.js";

/**
 * Class representing a Life Languages scores table for a group of people.
 * @class
 */
export class DTTable {
    /**
     * DTTable class constructor
     * @param {string} cTableId HTML ID of the table we are creating.
     * @param {array} data Data to display in the table. 
     * @returns {object} Initialized DTTable object.
     * @constructor
     */
    constructor(cTableId, data) {
        DEBUG.logArgs('DTTable.constructor(cTableId, data)', arguments);
        this.cTableId = '#' + cTableId;
        let that = this;
        let $table = $(this.cTableId);
        
        let tableData = {
            columns: data.columns,
            data: data.data,
            searching: false,
            paging: false,
            info: false,
            responsive: true,
            select: {
                style: 'multi',
                selector: 'td:first-child'
            },
            order: [[ 1, 'asc']],
            columnDefs: [
                {
                    orderable: false,
                    render: DataTable.render.select(),
                    targets: 0,
                    className: 'col-1'
                },
                { targets: 1, className: 'col-4', asSorting: ['asc', 'desc'] },
                { targets: [ 2, 3, 4, 5, 6, 6, 8 ], align: 'right', className: 'col-1', asSorting: ['asc', 'desc'] },
             ],
            footer: true,
            footerCallback: function updateFooter() { that._updateFooter($table); },
            layout: {
                topStart: null,
                topEnd: {
                    buttons: [
                        {
                            text: 'Life Languages',
                            extend: 'colvis',
                            columns: 'th:nth-child(n+3)',
                            columnText: function (dt, nIndex, cTitle) {
                                if (nIndex > 1)
                                    return LLLABELS[LLKEYS[nIndex - 2]];
                                return cTitle;
                            }
                        }
                    ]
                }
            }
        };
        
        let dt = $table.DataTable(tableData);
        dt.on('column-visibility.dt', that._onColumnVisibility.bind(that));
        dt.on('order.dt', that._onSort.bind(that));
        dt.on('select.dt', that._onSelect.bind(that));
        dt.on('deselect.dt', that._onDeselect.bind(that));
        dt.rows().select();
        
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
        this._updateFooter($table);

        if (this.mediator)
            this.mediator.tableHideColumn(LLKEYS[nColumn - 2], bState);
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

        //this._updateColumnHighlight($table);
        
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
                let cLL = LLKEYS[nSortIndex - 2];
                let cBorderTop = `${cLL}-border-top`;
                let bFlag = false;

                // Add new 50 line
                dt.rows().every(function (rowIdx, tableLoop, rowLoop) {
                    let rowData = this.data();
                    if (!bFlag && ((cSortDir == 'asc' && rowData[cLL] > 50) || (cSortDir == 'desc' && rowData[cLL] < 50))) {
                        bFlag = true;
                        $(this.node()).addClass(cBorderTop);
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
     * @param {object} dt DataTables API instance
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
            let cHighlight = `${LLKEYS[nSortedIndex - 2]}-highlight`;
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
        let arrows = [ 'bi-arrow-down', 'bi-arrow-down-right', 'bi-arrow-right', 'bi-arrow-up-right', 'bi-arrow-up' ];

        // Data for selected rows
        const selectedRows = dt.rows({ selected: true }).data();

        // Array indicating which columns are visible true/false.
        const visibleColumns = dt.columns().visible();

        // Find the average values for each column.
        const aAverages = LLKEYS.map(function (key, index) {
            if (visibleColumns[index + 2]) {
                // Data for selected rows
                const aValues = selectedRows.map(row => { 
                    return row[key];
                });
                return aValues.length > 0 ? (aValues.reduce((sum, val) => sum + val, 0) / aValues.length) : 0;
            } else 
                return undefined;   // Skip this column.
        });
                
        // Build the footer
        let cFooter = aAverages.reduce((accumulator, nAverage) => {
            if (nAverage == undefined)
                return accumulator;
            accumulator += '<th class="col-1 text-end">';
            if (nAverage > 0)
                accumulator += `<i class="bi ${arrows[COMMON.evaluateScoreLevel(nAverage)]} score-arrow"></i> ${Math.round(nAverage)}</th>`;
            return accumulator += '</th>';
        }, '<tr><th class="col-1"></th><th class="col-4">Group Average</th>');
        cFooter += '</tr>';

        $(dt.table().footer()).html(cFooter); 
        this._updateColumnHighlight($table);
    }
    
    /**
     * Select or deselect the specified row in the table
     * @param {integer} nIndex Index of the row to hide.
     * @param {boolean} bSelect True to select the row, false to deselect it.
     * @public
     */
    selectRow(nIndex, bSelect) {
        DEBUG.logArgs('DTTable.selectRow(nIndex, bSelect)', arguments);
        let $table = $(this.cTableId);
        let dt = $table.DataTable();
        
        if (bSelect)
            dt.row(nIndex).select();
        else
            dt.row(nIndex).deselect();
    }
    
    /**
     * Hide a particular column in the table.
     * @method 
     * @param {integer} nIndex Index of the column to hide (zero-based).
     * @param {boolean} bHidden True to hide the column, false to show it.
     * @public
     */
    hideColumn(columnName, bHidden) {
        DEBUG.logArgs('DTTable.hideColumn(columnName, bHidden)', arguments);
        let $table = $(this.cTableId);
        let dt = $table.DataTable();
        
        let column = dt.column(`${columnName}:name`);
        column.visible(!bHidden);
        dt.draw(false);

        this._updateColumnHighlight($table);
    }
}