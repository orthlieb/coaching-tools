import { ERROR } from "./Error.js";
import { DEBUG } from "./Debug.js";
import { COMMON } from "./Common.js";

 function getAverageForField(data, field) {
    //DEBUG.logType('getAverageForField', field);
    const result = data.reduce((acc, person) => {
        if (person.state) {
            acc.nPeople++;
            acc.nSum += person[field];
        }
        return acc;
    }, { nPeople: 0, nSum: 0 });
    let nAverage = result.nPeople ? result.nSum / result.nPeople : 0;
    //DEBUG.log('Field:', field, 'Average:', nAverage, 'Num people:', result.nPeople);
    return nAverage;
} 

function updateTableFooter(data) {
    let $footers = $('span[id^="footer-"]');
    $footers.each((index, footer) => {    
        // Strip off the 'footer-' prefix using a regular expression
        let field = $(footer).attr('id').replace(/^footer-/, '');
        $(footer).html(avgFooterFormatter(data, field));
    });    
}

function groupAverageLabel(data) {
   return 'Group Average';
}
// Formatters for BT need to be global?
window.avgFooterFormatter = avgFooterFormatter;
    
function avgFooterFormatter(data, field) {    
    field = (field == '') ? this.field : field;
    //DEBUG.logType('avgFooterFormatter After', field);

    let nAverage = Math.round(getAverageForField(data, field));
    let arrows = [ 'bi-arrow-down', 'bi-arrow-down-right', 'bi-arrow-right', 'bi-arrow-up-right', 'bi-arrow-up' ];
    let cText = nAverage ? `<i class="bi ${arrows[COMMON.evaluateScoreLevel(nAverage)]} score-arrow"></i> ${Math.round(nAverage)}` : '';
    return `<span id="footer-${field}">${cText}</span>`;
}
window.groupAverage = groupAverageLabel;

export class LLTable {
    constructor(cTableId, people) {
        this.cTableId = '#' + cTableId;
        let $table = $(this.cTableId);
        $table.bootstrapTable('load', people);

        // Table events
        $table.bootstrapTable('refreshOptions', {
            onCheck: (row, $element) => {
                DEBUG.log('Check', row.id, row.fullName);
                this.mediator.onCheckTable(row);
                updateTableFooter($table.bootstrapTable('getData'));
            },
            onUncheck: (row, $element) => {
                DEBUG.log('Uncheck', row.id, row.fullName);
                this.mediator.onUncheckTable(row);
                updateTableFooter($table.bootstrapTable('getData'));
            },
            onCheckAll: (rowsAfter, rowsBefore) => {
                DEBUG.logArgs('LLTable.onCheckAll(rowsAfter, rowsBefore)', arguments);
                this.mediator.onCheckAllTable();
                updateTableFooter($table.bootstrapTable('getData'));
            },
            onUncheckAll: (rowsAfter, rowsBefore) => {
                DEBUG.logArgs('LLTable.onColumnSwitch(rowsAfter, rowsBefore)', arguments);
                this.mediator.onUncheckAllTable();
                updateTableFooter($table.bootstrapTable('getData'));
            },
            onColumnSwitch: (field, checked) => {
                DEBUG.logArgs('LLTable.onColumnSwitch(field, checked)', arguments);
                this.mediator.onColumnSwitchTable(field, checked);
            },
            onColumnSwitchAll: (checked) => {
                DEBUG.logArgs('LLTable.onColumnSwitchAll(field)', arguments);
                this.mediator.onColumnSwitchAllTable(checked);
            },
            onPostBody: (newData) => {
                DEBUG.logArgs('LLTable.onPostBody(newData)', arguments);

                // Clear current header and body formatting.
                $(`${this.cTableId} > tbody > tr`).removeClass((index, className) => className.match(/\S+-top-border/g));
                $(`${this.cTableId} th`).removeClass((index, className) => className.match(/\S+-light-background/g));
                $(`${this.cTableId} th`).removeClass((index, className) => className.match(/\S+-dark-text-color/g));

                // Look at the headers to see which one is the sort column.
                //<div class="th-inner sortable both">&nbsp;</div>
                $('div.th-inner.sortable').each((index, element) => {
                    let $element = $(element);
                    let bAscending = $element.hasClass('asc');
                    let bDescending = $element.hasClass('desc');
                    if (bAscending || bDescending) {
                        let dataField = $element.parent().attr('data-field');

                        // Header and footer of the sorted field get highlighted for visual reference
                        // #rg-table > thead > tr:nth-child(1) > th.col-1.vertical.mover
                        $(`${this.cTableId} th.${dataField}`).addClass(`${dataField}-light-background ${dataField}-dark-text-color`);

                        // Determine where to draw 50 line in the table.
                        let bFlag = false;
                        newData.forEach((person, index) => {
                            if (!bFlag && ((bAscending && person[dataField] > 50) || (bDescending && person[dataField] < 50))) {
                                bFlag = true;
                                // #rg-table > tbody > tr:nth-child(1)
                                $(`${this.cTableId} > tbody > tr:nth-child(${index + 1})`).addClass(`${dataField}-border-top`);
                            }
                        });
                    }
                });
            }
        });
        
        // Handle printing events.
        window.addEventListener("beforeprint", (event) => {
            $("div.fixed-table-toolbar").addClass("d-none");
        });
        window.addEventListener("afterprint", (event) => {
            $('div.fixed-table-toolbar').removeClass('d-none');
        });

    }
    
    hideRow(fullName, bHide) {
        DEBUG.logArgs('LLTable.hideRow', arguments);
        let $table = $(this.cTableId);
        let data = $table.bootstrapTable('getData');  
        let nIndex = data.findIndex(person => { DEBUG.log(person.fullName); return person.fullName === fullName;});
        DEBUG.log('nIndex is', nIndex, '');
        $table.bootstrapTable(bHide ? 'uncheck' : 'check', nIndex);
    }
    
    hideColumn(columnName, bHidden) {
        DEBUG.logArgs('LLTable.hideColumn', arguments);
        let $table = $(this.cTableId);
        $table.bootstrapTable(bHidden ? 'hideColumn' : 'showColumn', columnName);
        
    }
}