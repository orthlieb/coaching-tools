import { ERROR } from './Error.js';
import { DEBUG } from "./Debug.js";
import { COMMON } from './Common.js';

/**
 * Given a set of Life Languages Data, sorts it into reverse order.
 * @param {object} data An object containing Life Language names and their scores.
 * @returns {array} Array of tuples, each tuple contains the name of the Life Language, followed by the score for that Life Language.
 */
function getSortedScores(data) {
    let aSortedScores = [];

    for (let cLL of COMMON.llKeys) {
         aSortedScores.push([cLL, data[cLL]]);
    }

    return aSortedScores
        .sort((obj1, obj2) => {
            if (obj1[1] < obj2[1]) return -1;
            else if (obj1[1] > obj2[1]) return 1;
            return 0;
        })
        .reverse();
}
/**
 * Creates a shorthand string to visualize the sorted order of the Life Languages for a particular person.
 * @param {array} sortedScores An array of tuples, each tuple contains the name of the Life Language, followed by the score for that Life Language. Typically the output of getSortedScores();
 * @returns {string} Shorthand string suitable for display.
 */
function createShorthandString(sortedScores) {
    let cShorthandString = "";

     ERROR.assertType(sortedScores, 'array', `createShorthandString parameter sortedScores`);

    for (let i = 0; i < sortedScores.length; i++) {
        let cKey = sortedScores[i][0];
        let nValue = sortedScores[i][1];

        // Gap indicator
        if (i != 0) {
            let nGap = sortedScores[i - 1][1] - nValue;

            // Normal
            if (nGap >= 5 && nGap <= 10) cShorthandString += "·";
            // Significant gap
            else if (nGap > 10) cShorthandString += "-";
        }
        let c = cKey[0].toUpperCase();
        cShorthandString += nValue >= 50 ? c : c.toLowerCase();
    }
    return cShorthandString;
}

Chart.register(ChartDataLabels);

// Detailed title, color info, and whether a bar graph needs to be reverse axis.
const communicationIndicatorDetails = {
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

/**
 * Draws a chart for a particular Communication Indicator.
 * @param {canvas} canvas to draw the chart into.
 * @param {string} cKey communication indicator selector.
 * @param {number} nDataValue The score for the Communication Indicator.
 * @returns {object} Returns the constructed chart object.
 */
function createCIChart(canvas, cKey, nDataValue) {
    ERROR.assertType(canvas, 'object', 'createCIChart parameter canvas');
    ERROR.assert(cKey in communicationIndicatorDetails, `createCIChart parameter ${cKey} is not in communicationIndicatorDetails`);

    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let details = communicationIndicatorDetails[cKey];

    let options = {
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

    // No data label for a zero score
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

    // Color is either a string (solid color), an array of two colors (gradient), or an object (use subkey to get color array or string)
    let color = details.color;
    if (Array.isArray(color)) {
        let ctx = canvas.getContext("2d");
        color = ctx.createLinearGradient(0, 0, canvas.offsetWidth, 0);
        color.addColorStop(0, details.color[0]);
        color.addColorStop(1, details.color[1]);
    }

    let chart = new Chart(canvas, {
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
        options: options
    });

    return chart;
}

const LOW = 33;
const MODERATE = 50;
const HIGH = 66;

/**
 * Evaluates whether a particular Communication Indicator is LOW, MODERATE, or HIGH or a specified set of labels using the limits provided.
 * @param {number} nValue The value to be evaluated.
 * @param {array} [aLevels = [LOW, HIGH]] An array containing two numbers that determine the break points for the different levels.
 * @param {array} [cLevels = ["LOW", "MODERATE", "HIGH"]] An array containing three labels to use when evaluating the CI.
 * @returns {string} Returns the evaluation of the CI.
 */
function evaluateCILevel(
    nValue,
    aLevels = [LOW, HIGH],
    cLevels = ["LOW", "MODERATE", "HIGH"]
) {
    ERROR.assertType(aLevels, "array", "evaluateCILevel parameter aLevels");
    ERROR.assert(aLevels.length == 2, `evaluateCILevel parameter aLevels expected array of length 2, received ${aLevels.length}`);
    ERROR.assertType(cLevels, "array", "evaluateCILevel parameter cLevels");
    ERROR.assert(cLevels.length == 3, `evaluateCILevel parameter cLevels expected array of length 3, received ${aLevels.length}`);

    if (nValue <= aLevels[0]) return cLevels[0];
    if (nValue >= aLevels[1]) return cLevels[2];
    return cLevels[1];
}
/**
 * Utility function to determine the appropriate forensics for the Contemplator Acceptance Level
 * @param {nValue} nValue The value to be evaluated.
 * @returns {string} Returns an HTML snippet that shows how the Life Language contributes to the CI.
 */
function acceptanceLevelContemplatorForensics(nValue) {
    if (nValue <= LOW) return "<strong>C*</strong>";
    return "c*";
}

/**
 * Utility function to determine the appropriate forensics for the Producer Internal Control
 * @param {nValue} nValue The value to be evaluated.
 * @returns {string} Returns an HTML snippet that shows how the Life Language contributes to the CI.
 */
function internalControlProducerForensics(nValue) {
    // Moderate to High
    if (nValue >= HIGH) return "<strong>p</strong>";
    else if (nValue > LOW) return "<strong>P</strong>";

    return "p";
}

/**
 * Utility function to determine the appropriate forensics for the Contemplator Internal Control
 * @param {nValue} nValue The value to be evaluated.
 * @returns {string} Returns an HTML snippet that shows how the Life Language contributes to the CI.
 */
function internalControlContemplatorForensics(nValue) {
    // Moderate to High
    if (nValue <= LOW) return "<strong>C*</strong>";

    return "c*";
}

/**
 * Utility function to determine the appropriate forensics for the Shaper Projective Level
 * @param {nValue} nValue The value to be evaluated.
 * @returns {string} Returns an HTML snippet that shows how the Life Language contributes to the CI.
 */
function projectiveLevelShaperForensics(nValue) {
    if (nValue >= HIGH) return "<strong>s</strong>";
    else if (nValue >= LOW) return "<strong>S</strong>";
    else return "s";
}

const forensicsTable = {
    acceptanceLevel: {
        mover: LOW,
        doer: HIGH,
        influencer: HIGH,
        responder: LOW,
        shaper: HIGH,
        producer: HIGH,
        contemplator: acceptanceLevelContemplatorForensics
    },
    internalControl: {
        mover: LOW,
        doer: HIGH,
        influencer: LOW,
        responder: LOW,
        shaper: HIGH,
        producer: internalControlProducerForensics,
        contemplator: internalControlContemplatorForensics
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
        shaper: projectiveLevelShaperForensics,
        producer: HIGH,
        contemplator: LOW
    }
};

/**
 * Evaluates whether a particular Life Language is contributing to the score for a particular Communication Indicator (except Interactive Style)
 * @param {string} cCI Key for which Communication Indicator to evaluate.
 * @param {string} cLL Key for which Life Language might contribute.
 * @param {number} nValue Value to the Communication Indicator.
 * @returns {string} Returns an HTML snippet that shows how the specified Life Language contributes to the CI.
 */
function evaluateForensicLevel(cCI, cLL, nValue) {
    let metric = forensicsTable[cCI][cLL];
    if (typeof metric == "function") {
        return metric(nValue);
    }

    if (metric == LOW && nValue <= LOW) {
        return "<strong>" + cLL[0].toUpperCase() + "</strong>";
    }
    if (metric == MODERATE && nValue > LOW && nValue < HIGH) {
        return "<strong>" + cLL[0].toUpperCase() + "</strong>";
    }
    if (metric == HIGH && nValue >= HIGH) {
        return "<strong>" + cLL[0].toUpperCase() + "</strong>";
    }

    return cLL[0].toLowerCase();
}

/**
 * Evaluates whether a particular Life Language is contributing to the score for Interactive Style
 * @param {string} cLL Key for which Life Language might contribute.
 * @param {string} cISType Single letter that indicates whether the individual is an Introvert "I", Balanced "B", or Extrovert "E".
 * @returns {string} Returns an HTML snippet that shows how the specified Life Language contributes to the Interactive Style.
 */
function interactiveStyleForensics(cLL, cISType) {
    let cContributor = cLL[0].toLowerCase();
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

/**
 * Validate incoming data.
 * @param {object} data Data to be validated.
 * Will throw if there is invalid data.
 */
function validateData(data) {
    ERROR.assert('fullName' in data, 'validateData missing parameter data.fullName');
    ERROR.assertType(data.fullName, 'string', `validateData "${data.fullName}" parameter data.fullName`);

    for (let cKey of COMMON.llKeys) {
        ERROR.assert(cKey in data, `validateData "${data.fullName}" missing parameter data.${cKey}`);
        ERROR.assertType(data[cKey], 'number', `validateData "${data.fullName}" parameter data.${cKey}`);
        ERROR.assertRange(data[cKey], 0, 100, `validateData "${data.fullName}" parameter data.${cKey}`);
    }
    
    ERROR.assert('overallIntensity' in data, `validateData "${data.fullName}" missing parameter data.overallIntensity`);
    ERROR.assertType(data.overallIntensity, 'number', `validateData "${data.fullName}" parameter data.overallIntensity`);
    ERROR.assertRange(data.overallIntensity, 0, 100, `validateData "${data.fullName}" parameter data.overallIntensity`);


    for (let cKey of COMMON.ciKeys) {
        ERROR.assert(cKey in data, `validateData "${data.fullName}" missing parameter data.${cKey}`);
        if (cKey === "interactiveStyleType") {
            ERROR.assertType(data.interactiveStyleType, 'string', `validateData "${data.fullName}" parameter data.interactiveStyleType`);
            ERROR.assert(/^[IEB]$/i.test(data.interactiveStyleType), `validateData "${data.fullName}" parameter data.interactiveStyleType should be either the letter I, E, or B, found ${data.interactiveStyleType}`);
         } else {
            ERROR.assertType(data[cKey], 'number', `validateData "${data.fullName}" parameter data.${cKey}`);
            ERROR.assertRange(data[cKey], 0, 100, `validateData "${data.fullName}" parameter data.${cKey}`);
        }
    }
}

Chart.register(ChartDataLabels);

/**
 * Main function to draw the Communication Indicators.
 * @param {string} cSuffix Suffix to add find the appropriate parent div.
 * @param {object} data Data to be displayed.
 */
export function displayCommunicationIndicators(cSuffix, data) {
    validateData(data);
    
    let aSortedScores = getSortedScores(data);
    let ciElement = document.getElementById("cipage-" + cSuffix);

    ciElement.querySelector(".fullName").innerText = data.fullName;
    if (data.companyName)
        ciElement.querySelector(".companyName").innerText = data.companyName;
    ciElement.querySelector(".shorthand").innerText =
        createShorthandString(aSortedScores);

    // Hide fornesics if not requested.
    let bHidden = !data.showForensics;
    for (let obj of ciElement.getElementsByClassName("forensic")) {
        obj.hidden = bHidden;
    }

    // Acceptance Level Section
    let cKey = "acceptanceLevel";
    createCIChart(ciElement.querySelector(`.${cKey}Chart`), cKey, data[cKey]);
    ciElement.querySelector(`.${cKey}Status`).innerText = evaluateCILevel(
        data[cKey],
        [LOW, HIGH],
        ["LOW", "MEDIUM", "HIGH"]
    );
    ciElement.querySelector(`.${cKey}Score`).innerText = data[cKey];
    for (let i = 0; i < aSortedScores.length; i++) {
        let element = ciElement.querySelector(`.${cKey}LifeLanguage${i + 1}`);
        element.innerHTML = evaluateForensicLevel(
            cKey,
            aSortedScores[i][0],
            data[cKey]
        );
    }

    // Interactive Style Section
    cKey = "interactiveStyle";
    let cType = data[`${cKey}Type`];
    let nValue = data[`${cKey}Score`];

    createCIChart(
        ciElement.querySelector(`.${cKey}IntrovertChart`),
        "interactiveStyleIntrovert",
        cType == "I" ? nValue : 0
    );
    createCIChart(
        ciElement.querySelector(`.${cKey}BalancedChart`),
        "interactiveStyleBalanced",
        cType == "B" ? nValue : 0
    );
    createCIChart(
        ciElement.querySelector(`.${cKey}ExtrovertChart`),
        "interactiveStyleExtrovert",
        cType == "E" ? nValue : 0
    );
    ciElement.querySelector(`.${cKey}Status`).innerText =
        evaluateCILevel(nValue);
    ciElement.querySelector(`.${cKey}Score`).innerText = nValue;
    for (let i = 0; i < aSortedScores.length; i++) {
        let element = ciElement.querySelector(`.${cKey}LifeLanguage${i + 1}`);
        element.innerHTML = interactiveStyleForensics(
            aSortedScores[i][0],
            cType
        );
    }

    // Internal Control Section
    cKey = "internalControl";
    createCIChart(ciElement.querySelector(`.${cKey}Chart`), cKey, data[cKey]);
    ciElement.querySelector(`.${cKey}Status`).innerText = evaluateCILevel(
        data[cKey]
    );
    ciElement.querySelector(`.${cKey}Score`).innerText = data[cKey];
    for (let i = 0; i < aSortedScores.length; i++) {
        let element = ciElement.querySelector(`.${cKey}LifeLanguage${i + 1}`);
        element.innerHTML = evaluateForensicLevel(
            cKey,
            aSortedScores[i][0],
            data[cKey]
        );
    }

    // Intrusion Level Section
    cKey = "intrusionLevel";
    createCIChart(ciElement.querySelector(`.${cKey}Chart`), cKey, data[cKey]);
    ciElement.querySelector(`.${cKey}Status`).innerText = evaluateCILevel(
        data[cKey]
    );
    ciElement.querySelector(`.${cKey}Score`).innerText = data[cKey];
    for (let i = 0; i < aSortedScores.length; i++) {
        let element = ciElement.querySelector(`.${cKey}LifeLanguage${i + 1}`);
        element.innerHTML = evaluateForensicLevel(
            cKey,
            aSortedScores[i][0],
            data[cKey]
        );
    }

    // Projective Level Section
    cKey = "projectiveLevel";
    createCIChart(ciElement.querySelector(`.${cKey}Chart`), cKey, data[cKey]);
    ciElement.querySelector(`.${cKey}Status`).innerText = evaluateCILevel(
        data[cKey]
    );
    ciElement.querySelector(`.${cKey}Score`).innerText = data[cKey];
    for (let i = 0; i < aSortedScores.length; i++) {
        let element = ciElement.querySelector(`.${cKey}LifeLanguage${i + 1}`);
        element.innerHTML = evaluateForensicLevel(
            cKey,
            aSortedScores[i][0],
            data[cKey]
        );
    }

    // Susceptibility To Stress Section
    cKey = "susceptibilityToStress";
    createCIChart(ciElement.querySelector(`.${cKey}Chart`), cKey, data[cKey]);
    ciElement.querySelector(`.${cKey}Status`).innerText = evaluateCILevel(
        data[cKey]
    );
    ciElement.querySelector(`.${cKey}Score`).innerText = data[cKey];

    // Learning Preference Section
    cKey = "learningPreferenceAuditory";
    createCIChart(ciElement.querySelector(`.${cKey}Chart`), cKey, data[cKey]);
    ciElement.querySelector(`.${cKey}Status`).innerText = evaluateCILevel(
        data[cKey]
    );
    ciElement.querySelector(`.${cKey}Score`).innerText = data[cKey];

    cKey = "learningPreferenceVisual";
    createCIChart(ciElement.querySelector(`.${cKey}Chart`), cKey, data[cKey]);
    ciElement.querySelector(`.${cKey}Status`).innerText = evaluateCILevel(
        data[cKey]
    );
    ciElement.querySelector(`.${cKey}Score`).innerText = data[cKey];

    cKey = "learningPreferencePhysical";
    createCIChart(ciElement.querySelector(`.${cKey}Chart`), cKey, data[cKey]);
    ciElement.querySelector(`.${cKey}Status`).innerText = evaluateCILevel(
        data[cKey]
    );

    ciElement.querySelector(`.${cKey}Score`).innerText = data[cKey];

    // Handle printing events.
    window.addEventListener("beforeprint", (event) => {
        let collection = ciElement.getElementsByClassName("print-full");
        for (let i = 0; i < collection.length; i++) {
            const chart = collection.item(i);
            // 1101 is a complete hack for Letter size paper portrait orientation.
            Chart.getChart(chart).resize(1101, 75);
        }
        collection = ciElement.getElementsByClassName("print-one-third");
        for (let i = 0; i < collection.length; i++) {
            const chart = collection.item(i);
            // 1101 is a complete hack for Letter size paper portrait orientation.
            Chart.getChart(chart).resize(1101 / 3, 75);
        }
    });

    window.addEventListener("afterprint", (event) => {
        for (let id in Chart.instances) {
            let chart = Chart.instances[id];
            chart.resize();
        }
    });
}