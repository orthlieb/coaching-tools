/*
 * @module modules/DTTable
 * @author Carl Orthlieb
 */
import { ERROR } from "./Error.js";
import { DEBUG } from "./Debug.js";
import { COMMON } from "./Common.js";

/**
 * Class representing a Life Languages scores table for a group of people.
 * @class
 */
export class DTTable {
    /**
     * DTTable class constructor
     * @param {string} cTableId HTML ID of the table we are creating.
     * @param {array} data Data to display in the table. 
     * @param {object} mediator Mediator object that will catch events.
     * @returns {object} Initialized DTTable object.
     * @constructor
     */
    constructor(cTableId, data, mediator = null) {
        DEBUG.logArgs('DTTable.constructor(cTableId, data)', arguments);
        this.mediator = mediator;
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
            ],
            footer: true,
            footerCallback: function updateFooter() { 
                that._updateFooter($table); 
            }.bind(that)
        };
        if (data.layout)
            tableData.layout = data.layout;
        
        let dt = $table.DataTable(tableData);
        // Use rows().every() to loop through each row and select rows where state is true
        dt.rows().every(function(rowIdx, tableLoop, rowLoop) {
            var data = this.data(); // Get the row's data

            // Check if the 'state' property is true
            if (data.state === true) {
                this.select(); // Select the row
            }
        });
        
        // Register events.
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
        
        dt.draw();
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
        let cFooter = "";
        if (this.mediator)
            cFooter = this.mediator.tableUpdateFooter(dt.columns().dataSrc(), dt.rows({ selected: true }).data(), dt.columns().visible());

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