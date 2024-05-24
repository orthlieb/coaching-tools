import { ERROR } from "./Error.js";
import { LLKEYS, LLLABELS, LLCOLORS, LLCOLORS_LIGHT } from "./Common.js";
import { DEBUG } from "./Debug.js";

import { LLRadarChart } from "./BTPRGRadarChart.js";
import { LLTable } from "./BTPRGTable.js";
import { LLPerson } from "./BTPerson.js";
        
export class LLMediator {
    constructor(data, tableId, graphId) {
        this.people = this._validateData(data);
        // Data prep
        let id = 0;
        this.people.forEach(person => {
            person.label = person.fullName;
            
            let hue = (id++ * 137) % 360;
            person.color = {
                solid: `hsl(${hue}, 70%, 50%)`,
                light: `hsl(${hue}, 70%, 75%)`,
                dark: `hsl(${hue}, 70%, 25%)`,
                translucent: `hsla(${hue}, 70%, 50%, 25%)`
            };
        });
        
        this.columns = [...LLKEYS];
        this.labels = [...LLLABELS];
        this.sortColumn = 'fullName';
        this.sortOrder = 'asc';

        let companyName = this.people[0].companyName;
        if (companyName)
            $('.companyname').html(companyName).removeClass('d-none');
        
        this.theTable = new LLTable(tableId, this.people);
        this.theTable.mediator = this;
        this.theChart = new LLRadarChart(graphId, this.people, this.columns, this.labels);
        this.theChart.mediator = this;
    }
    
    /**
     * Validate the data passed into us.
     * @param {array} data Array of people objects containing Life Language info.
     * Will throw if there is invalid data.
     */
    _validateData(data) {
        let people = [];
        for (let i = 0; i < data.length; i++) {
            try {
                let person = new LLPerson(data[i]);
                people.push(person);
            } catch (e) {
                DEBUG.log(e);
                ERROR.appendAlert(e, 'error');
            }
        }
        ERROR.assert(people.length > 2, `validateData not enough valid people for generating radar graph, must be > 2, found ${people.length}`);
        return people;
    }
    
    onSortTable(newData, cDataField, cSort) {
        DEBUG.log('LLMediator.onSortTable newData:', newData, 'cDataField:', cDataField, 'cSort:', cSort);
    }
    
    onCheckTable(row) {
        DEBUG.log('LLMediator.onCheckTable', row);
        const person = this.people.find(person => person.fullName === row.fullName);
        person.state = true;
        this.theChart.hideShowDataset(person.fullName, false);
    }
        
    onUncheckTable(row) {
        DEBUG.log('LLMediator onUncheckTable', row);
        const person = this.people.find(person => person.fullName === row.fullName);
        person.state = false;
        this.theChart.hideShowDataset(row.fullName, true);
    }
        
    onCheckAllTable() {
        DEBUG.log('LLMediator.onCheckAllTable');
        this.people.forEach(person => person.state = true);
        this.theChart.showAll();
        
    }
        
    onUncheckAllTable() {
        DEBUG.log('MedLLMediatoriator.onUncheckAllTable');
        this.people.forEach(person => person.state = false);
        this.theChart.hideAll();  
    }
    
    onClickLegendGraph(fullName, hidden) {
        DEBUG.logArgs('LLMediator.onClickLegendGraph', arguments);
        this.theTable.hideShowPerson(fullName, hidden);
    }
    
    onColumnSwitchTableAll(checked) {
        DEBUG.logArgs('LLMediator.onColumnSwitchTableAll(checked)', arguments);
        this.columns = checked ? [...LLKEYS] : [];
        this.labels = checked ? [...LLLABELS] : [];
        this.theChart.loadData(this.people, this.columns, this.labels );
    }

    onColumnSwitchTable(field, checked) {
        DEBUG.logArgs('LLMediator.onColumnSwitchTable(field, checked)', arguments);
        let newColumns = [];
        let newLabels = [];
        
        LLKEYS.forEach(key => {
            if (field == key) {
                // Matches the selected item
                if (checked) {
                    // Add it to the columns/labels.
                    newColumns.push(key);
                    newLabels.push(LLLABELS[LLKEYS.indexOf(key)]);
                }
            } else if (this.columns.includes(key)) {
                // Existing column/label, copy it over.
                newColumns.push(key);
                newLabels.push(LLLABELS[LLKEYS.indexOf(key)]);
            }
        });
        this.columns = newColumns;
        this.labels = newLabels;
        this.theChart.loadData(this.people, this.columns, this.labels );
    }

    
    //tableColumnSelect:
    //tableColumnUnselect:
    //tableDrawLine:
    //graphSelect:
    //graphUnselect:
}