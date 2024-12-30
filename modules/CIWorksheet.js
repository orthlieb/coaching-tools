import { ERROR } from "./Error.js";
import { DEBUG } from "./Debug.js";
import { COMMON } from "./Common.js";
import { LLPerson } from "./Person.js";
import { STRINGS } from "./Strings.js";

Chart.register(ChartDataLabels);

const _communicationIndicatorDetails = {
    acceptanceLevel: {
        title: "Acceptance Level",
        color: ["#D93C4B", "#8D181C"],
        reversed: false
    },
    interactiveStyleIntrovert: {
        title: "Introvert",
        color: "#2E3192",
        reversed: true
    },
    interactiveStyleBalanced: {
        title: "Balanced",
        color: ["#2E3192", "#ED1C24"],
        reversed: false
    },
    interactiveStyleExtrovert: {
        title: "Extrovert",
        color: "#ED1C24",
        reversed: false
    },
    internalControl: {
        title: "Internal Control",
        color: ["#F9A150", "#C75B27"],
        reversed: false
    },
    intrusionLevel: {
        title: "Intrusion Level",
        color: ["#FCD72B", "#DFB825"],
        reversed: false
    },
    projectiveLevel: {
        title: "Projective Level",
        color: ["#BCD630", "#2E6933"],
        reversed: false
    },
    susceptibilityToStress: {
        title: "Susceptibility to Stress",
        color: ["#89D0C3", "#186C66"],
        reversed: false
    },
    learningPreferenceAuditory: {
        title: "Auditory",
        color: "#4472C4",
        reversed: false
    },
    learningPreferencePhysical: {
        title: "Physical",
        color: "#FCD72B",
        reversed: false
    },
    learningPreferenceVisual: {
        title: "Visual",
        color: "#C21E30",
        reversed: false
    }
};

const LOW = 33;
const MODERATE = 50;
const HIGH = 66;

/**
 * Utility function to determine the appropriate forensics for the Contemplator Acceptance Level
 * @param {nValue} nValue The value to be evaluated.
 * @returns {string} Returns an HTML snippet that shows how the Life Language contributes to the CI.
 * @private
 */
function _acceptanceLevelContemplatorForensics(nValue) {
    if (nValue <= LOW) return "<strong>C*</strong>";
    return "c*";
}

/**
 * Utility function to determine the appropriate forensics for the Producer Internal Control
 * @param {nValue} nValue The value to be evaluated.
 * @returns {string} Returns an HTML snippet that shows how the Life Language contributes to the CI.
 * @private
 */
function _internalControlProducerForensics(nValue) {
    // Moderate to High
    if (nValue >= HIGH) return "<strong>p</strong>";
    else if (nValue > LOW) return "<strong>P</strong>";

    return "p";
}

/**
 * Utility function to determine the appropriate forensics for the Contemplator Internal Control
 * @param {nValue} nValue The value to be evaluated.
 * @returns {string} Returns an HTML snippet that shows how the Life Language contributes to the CI.
 * @private
 */
function _internalControlContemplatorForensics(nValue) {
    // Moderate to High
    if (nValue <= LOW) return "<strong>C*</strong>";

    return "c*";
}

/**
 * Utility function to determine the appropriate forensics for the Shaper Projective Level
 * @param {nValue} nValue The value to be evaluated.
 * @returns {string} Returns an HTML snippet that shows how the Life Language contributes to the CI.
 * @private
 */
function _projectiveLevelShaperForensics(nValue) {
    if (nValue >= HIGH) return "<strong>s</strong>";
    else if (nValue >= LOW) return "<strong>S</strong>";
    else return "s";
}

const _forensicsTable = {
    acceptanceLevel: {
        mover: LOW,
        doer: HIGH,
        influencer: HIGH,
        responder: LOW,
        shaper: HIGH,
        producer: HIGH,
        contemplator: _acceptanceLevelContemplatorForensics
    },
    internalControl: {
        mover: LOW,
        doer: HIGH,
        influencer: LOW,
        responder: LOW,
        shaper: HIGH,
        producer: _internalControlProducerForensics,
        contemplator: _internalControlContemplatorForensics
    },
    intrusionLevel: {
        mover: LOW,
        doer: LOW,
        influencer: HIGH,
        responder: HIGH,
        shaper: HIGH,
        producer: MODERATE,
        contemplator: HIGH
    },
    projectiveLevel: {
        mover: LOW,
        doer: HIGH,
        influencer: HIGH,
        responder: HIGH,
        shaper: _projectiveLevelShaperForensics,
        producer: HIGH,
        contemplator: LOW
    }
};

/**
 * Evaluates whether a particular Life Language is contributing to the score for a particular Communication Indicator (except Interactive Style)
 * @param {string} cCI Key for which Communication Indicator to evaluate.
 * @param {string} cLL Key for which Life Language might contribute.
 * @param {number} nValue Value of the Communication Indicator.
 * @returns {string} Returns an HTML snippet that shows how the specified Life Language contributes to the CI.
 * @private
 */
function _evaluateForensicLevel(cCI, cLL, nValue) {
    DEBUG.logArgs('_evaluateForensicLevel(cCI, cLL, nValue)', arguments);
    
    if (cCI == 'interactiveStyle') {
        let interactiveStyle = LLPerson.composeInteractiveStyle(nValue);
        return _interactiveStyleForensics(cLL, interactiveStyle[1]);
    } else {
        let metric = _forensicsTable[cCI][cLL];
        if (typeof metric == "function") {
            return metric(nValue);
        }
        if (metric == LOW && nValue <= LOW) {
            return "<strong>" + STRINGS.shorthand[cLL].toUpperCase() + "</strong>";
        }
        if (metric == MODERATE && nValue > LOW && nValue < HIGH) {
            return "<strong>" + STRINGS.shorthand[cLL].toUpperCase() + "</strong>";
        }
        if (metric == HIGH && nValue >= HIGH) {
            return "<strong>" + STRINGS.shorthand[cLL].toUpperCase() + "</strong>";
        }

        return cLL[0].toLowerCase();
    }
    /**
 * Evaluates whether a particular Life Language is contributing to the score for Interactive Style
 * @param {string} cLL Key for which Life Language might contribute.
 * @param {string} cISType Single letter that indicates whether the individual is an Introvert "I", Balanced "B", or Extrovert "E".
 * @returns {string} Returns an HTML snippet that shows how the specified Life Language contributes to the Interactive Style.
 */
function _interactiveStyleForensics(cLL, cISType) {
    let cContributor = STRINGS.shorthand[cLL].toLowerCase();
    switch (cLL) {
        case "mover": // Balanced to Introvert
            if (cISType == "B") cContributor = cContributor.toUpperCase();
            if (cISType != "E")
                cContributor = "<strong>" + cContributor + "</strong>";
            break;
        case "doer": // Introvert
        case "responder":
        case "contemplator":
            if (cISType == "I")
                cContributor =
                    "<strong>" + cContributor.toUpperCase() + "</strong>";

            break;
        case "influencer": // Extrovert
            if (cISType == "E")
                cContributor =
                    "<strong>" + cContributor.toUpperCase() + "</strong>";
            break;
        case "shaper": // Balanced
        case "producer":
            if (cISType == "E")
                cContributor =
                    "<strong>" + cContributor.toUpperCase() + "</strong>";
            break;
        default:
            ERROR.assert(false, "Incorrect Life Language type", cLL);
            break;
    }
    return cContributor;
}

}

/**
 * Evaluates the communication indicator level (e.g., Low, Moderate, High).
 * @private
 * @param {number} nValue - The value to evaluate.
 * @param {number[]} [aLevels=[33, 66]] - Thresholds for the levels.
 * @param {string[]} [cLevels=null] - Custom level labels.
 * @returns {string} - The level (e.g., "Low", "Moderate", "High").
 */
function _evaluateCILevel(nValue, aLevels = [33, 66], cLevels = null) {
    if (!Array.isArray(cLevels)) {
        cLevels = [STRINGS.ciLevels.low, STRINGS.ciLevels.moderate, STRINGS.ciLevels.high];
    }

    if (nValue <= aLevels[0]) return cLevels[0];
    if (nValue >= aLevels[1]) return cLevels[2];
    return cLevels[1];
}

export class CIWorksheet {
    // Detailed title, color info, and whether a bar graph needs to be reverse axis.

    /**
     * Creates an instance of CIWorksheet.
     * @param {Object} data - The data for the worksheet, typically an LLPerson object.
     * @param {string} suffix - A unique identifier for the DOM elements related to this worksheet.
     */
    constructor(data, suffix) {
        this.data = data;
        this.suffix = suffix;
        this.person = this._validateData(data);
    }

    /**
     * Validates the input data and initializes an LLPerson instance.
     * @private
     * @param {Object} data - The input data.
     * @returns {LLPerson} - The validated LLPerson instance.
     */
    _validateData(data) {
        DEBUG.logArgs("validateData(data)", arguments);
        return new LLPerson(data);
    }

    /**
     * Creates a communication indicator chart.
     * @private
     * @param {HTMLCanvasElement} canvas - The canvas element where the chart will be drawn.
     * @param {string} cKey - The key identifying the communication indicator.
     * @param {number} nDataValue - The value to be visualized in the chart.
     * @returns {Chart} - The created Chart.js instance.
     */
    _createCIChart(canvas, cKey, nDataValue) {
        ERROR.assertType(canvas, "object", "createCIChart parameter canvas");
        ERROR.assert(
            cKey in _communicationIndicatorDetails,
            `createCIChart parameter ${cKey} is not in communicationIndicatorDetails`
        );

        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        const details = _communicationIndicatorDetails[cKey];
        const options = {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: "y",
            scales: {
                x: {
                    min: 0,
                    max: 100,
                    reverse: details.reversed
                },
                y: { beginAtZero: true }
            },
            plugins: { legend: false }
        };

        if (nDataValue) {
            options.plugins.datalabels = {
                anchor: details.reversed ? "start" : "end",
                align: details.reversed ? "right" : "left",
                formatter: Math.round,
                color: "white",
                font: {
                    size: 12,
                    weight: "bold"
                }
            };
        }

        let color = details.color;
        if (Array.isArray(color)) {
            const ctx = canvas.getContext("2d");
            // Ensure canvas dimensions are properly set before creating the gradient
            if (!canvas.width || !canvas.height) {
                canvas.width = canvas.offsetWidth;
                canvas.height = canvas.offsetHeight;
            }
            color = ctx.createLinearGradient(0, 0, canvas.width, 0);
            color.addColorStop(0, details.color[0]);
            color.addColorStop(1, details.color[1]);
        }
        
        return new Chart(canvas, {
            type: "bar",
            data: {
                labels: [""],
                datasets: [
                    {
                        label: details.title,
                        data: [nDataValue],
                        borderWidth: 1,
                        backgroundColor: color,
                        barThickness: 15
                    }
                ]
            },
            options
        });
    }

    /**
     * Renders a communication indicator section in the DOM.
     * @private
     * @param {HTMLElement} ciElement - The container element for the section.
     * @param {LLPerson} person - Person you are rendering for.
     * @param {string} cKey - The key identifying the communication indicator section.
     */
    _renderCISection(ciElement, person, cSection) {
        DEBUG.logArgs('_renderCISection(ciElement, person, cSection)', arguments);
        
        // Chart(s)
        switch (cSection) {
            case 'interactiveStyle':
                let is = LLPerson.composeInteractiveStyle(person[cSection]);
                let nValue = is[0];
                let cType = is[1];

                this._createCIChart(
                    ciElement.querySelector(`.${cSection}IntrovertChart`),
                    'interactiveStyleIntrovert',
                    cType == "I" ? nValue : 0
                );
                this._createCIChart(
                    ciElement.querySelector(`.${cSection}BalancedChart`),
                    'interactiveStyleBalanced',
                    cType == "B" ? nValue : 0
                );
                this._createCIChart(
                    ciElement.querySelector(`.${cSection}ExtrovertChart`),
                    'interactiveStyleExtrovert',
                    cType == "E" ? nValue : 0
                );        
                break;
            case 'learningPreference':
                this._createCIChart(
                    ciElement.querySelector(`.${cSection}AuditoryChart`),
                    'learningPreferenceAuditory', person.learningPreferenceAuditory);
                this._createCIChart(
                    ciElement.querySelector(`.${cSection}VisualChart`),
                    'learningPreferenceVisual', person.learningPreferenceVisual);
                this._createCIChart(
                    ciElement.querySelector(`.${cSection}PhysicalChart`),
                    'learningPreferencePhysical', person.learningPreferencePhysical);
                break;
            default:
                this._createCIChart(ciElement.querySelector(`.${cSection}Chart`), cSection, this.person[cSection]);
                break;
        }
        
        // Status and score
        switch (cSection) {
            case 'acceptanceLevel':
                ciElement.querySelector(`.${cSection}Status`).innerText = _evaluateCILevel(this.person[cSection],
                    [LOW, HIGH], [STRINGS.ciLevels.low, STRINGS.ciLevels.medium, STRINGS.ciLevels.high]);
                ciElement.querySelector(`.${cSection}Score`).innerText = this.person[cSection];
                break;
            case 'interactiveStyle':
                let interactiveStyle = LLPerson.composeInteractiveStyle(this.person.interactiveStyle);
                ciElement.querySelector(`.${cSection}Status`).innerText = _evaluateCILevel(this.person[cSection]);
                ciElement.querySelector(`.${cSection}Score`).innerText = `${interactiveStyle[0]} ${interactiveStyle[1]}`;
                break;
            case 'learningPreference':
                let cSubSection = 'learningPreferenceAuditory';
                let nScore = person[cSubSection];
                ciElement.querySelector(`.${cSubSection}Status`).innerText = _evaluateCILevel(nScore);
                ciElement.querySelector(`.${cSubSection}Score`).innerText = person[nScore];

                cSubSection = 'learningPreferenceVisual';
                nScore = person[cSubSection];
                ciElement.querySelector(`.${cSubSection}Status`).innerText = _evaluateCILevel(nScore);
                ciElement.querySelector(`.${cSubSection}Score`).innerText = nScore;

                cSubSection = 'learningPreferencePhysical';
                ciElement.querySelector(`.${cSubSection}Status`).innerText = _evaluateCILevel(person[cSubSection]);
                ciElement.querySelector(`.${cSubSection}Score`).innerText = nScore;
                break;
            default:
                ciElement.querySelector(`.${cSection}Status`).innerText = _evaluateCILevel(this.person[cSection]);
                ciElement.querySelector(`.${cSection}Score`).innerText = this.person[cSection];
                break;
        }
         
        // Forensics is for every CI except susceptibilityToStress
        if (cSection != 'susceptibilityToStress' && cSection != 'learningPreference') {
            for (let i = 0; i < this.person.sortedScores.length; i++) {
                const element = ciElement.querySelector(`.${cSection}LifeLanguage${i + 1}`);
                element.innerHTML = _evaluateForensicLevel(cSection, this.person.sortedScores[i].key, this.person[cSection]);
            }
        }
    }

    /**
     * Displays the communication indicators worksheet in the DOM.
     */
    display() {
        const ciElement = document.getElementById(`cipage-${this.suffix}`);
        ciElement.querySelector(".fullName").innerText = this.person.fullName;
        if (this.person.companyName) {
            ciElement.querySelector(".companyName").innerText = this.person.companyName;
        }
        ciElement.querySelector(".shorthand").innerText = this.person.getShorthandString();

        const sections = [
            "acceptanceLevel",
            "interactiveStyle",
            "internalControl",
            "intrusionLevel",
            "projectiveLevel",
            "susceptibilityToStress",
            "learningPreference"
        ];
        sections.forEach((section) => this._renderCISection(ciElement, this.person, section));

        window.addEventListener("beforeprint", this._handleBeforePrint.bind(this));
        window.addEventListener("afterprint", this._handleAfterPrint.bind(this));
    }

    /**
     * Handles resizing charts for printing.
     * @private
     * @param {Event} event - The beforeprint event.
     */
    _handleBeforePrint(event) {
        const collection = document.getElementsByClassName("print-full");
        for (let i = 0; i < collection.length; i++) {
            const chart = collection.item(i);
            Chart.getChart(chart).resize(1101, 75);
        }
    }

    /**
     * Handles resizing charts back to normal after printing.
     * @private
     * @param {Event} event - The afterprint event.
     */
    _handleAfterPrint(event) {
        for (const id in Chart.instances) {
            const chart = Chart.instances[id];
            chart.resize();
        }
    }
}