/*
 * @module modules/BaseMediator
 * @author Carl Orthlieb
 *
 * Shared scaffolding for mediators that own a list of LLPersons + an LLTable/CITable + a chart.
 *
 * Subclasses implement (at minimum):
 *   - `_prepChartData(columnState, people)` — return data for the chart
 *   - any of `tableSelectRow`, `tableHideColumn`, `graphClickLegend` they actually need
 *
 * BaseMediator handles:
 *   - validating raw data into LLPerson instances and stashing them on `this.people`
 *   - revealing the .companyname element when the first person has a companyName
 *   - initializing this.columnState from a key list (all-on)
 *   - the re-entrancy guard pattern (formerly named "debounce")
 */

import { ERROR } from "./Error.js";
import { COMMON } from "./Common.js";
import { DEBUG } from "./Debug.js";
import { LLPerson } from "./Person.js";

/** @class */
export class BaseMediator {
    /**
     * @param {array} data Raw people objects (unvalidated).
     * @param {string[]} columnStateKeys Keys to seed `this.columnState` with (all true).
     * @param {object} [options]
     * @param {boolean} [options.applyDefaultPersonState] Default true. Sets `person.state = true` on each person.
     * @param {boolean} [options.singlePerson] Default false. When true, validates a single person object and stashes it on `this.person` instead of `this.people`.
     */
    constructor(data, columnStateKeys, options = {}) {
        const { applyDefaultPersonState = true, singlePerson = false } = options;
        this._guardOpen = true;

        if (singlePerson) {
            this.person = this._validatePerson(data);
        } else {
            this.people = this._validatePeople(data);
            if (applyDefaultPersonState) this.people.forEach((p) => (p.state = true));
        }

        const first = singlePerson ? this.person : this.people[0];
        const companyName = first && first.companyName;
        if (companyName) {
            $(".companyname").html(companyName).removeClass("d-none");
        }

        this.columnState = {};
        columnStateKeys.forEach((key) => (this.columnState[key] = true));
    }

    /**
     * Validate an array of person objects, skipping (and surfacing alerts for) any that throw.
     * Throws if no valid people remain.
     * @returns {LLPerson[]}
     * @private
     */
    _validatePeople(data) {
        DEBUG.logArgs("BaseMediator._validatePeople(data)", arguments);
        const people = [];
        for (let i = 0; i < data.length; i++) {
            try {
                people.push(new LLPerson(data[i]));
            } catch (e) {
                DEBUG.log(e);
                COMMON.displayAlertInDoc(e.message || String(e));
            }
        }
        ERROR.assert(people.length > 0, "BaseMediator: no valid people in incoming data");
        return people;
    }

    /**
     * Validate a single person; throws if invalid.
     * @returns {LLPerson}
     * @private
     */
    _validatePerson(data) {
        DEBUG.logArgs("BaseMediator._validatePerson(data)", arguments);
        return new LLPerson(data);
    }

    /**
     * Run `fn` with the re-entrancy guard held. While the guard is held, nested calls
     * to `_guarded` are no-ops. This prevents feedback loops between the table and chart
     * (e.g., a chart legend click that updates the table firing a select event that
     * tries to update the chart again).
     * @protected
     */
    _guarded(fn) {
        if (!this._guardOpen) return;
        this._guardOpen = false;
        try {
            fn();
        } finally {
            this._guardOpen = true;
        }
    }
}
