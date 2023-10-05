function DEBUG_ASSERT(assertion, ...msgs) {
    if (!assertion) {
        throw (msgs.reduce((cMsg, cSnippet) => cMsg += " " + cSnippet));
    }
    return assertion;
}

let LLKEYS = ["mover", "doer", "influencer", "responder", "shaper",
           "producer", "contemplator"];

let CIKEYS = ["acceptanceLevel", "interactiveStyle", "internalControl",
             "intrusionLevel", "projectiveLevel", "susceptibilityToStress", "learningPreferenceAuditory",
             "learningPreferenceVisual", "learningPreferencePhysical"];

/**
 * Given a set of Life Languages Data, sorts it into reverse order.
 * @param {object} data An object containing Life Languages and their scores.
 * @returns {array} Array of tuples, each tuple contains the name of the Life Language, followed by the score for that Life Language.
 */
function getSortedScores(data) {
    let aSortedScores = [];
    
    for (let cLL of LLKEYS) {
        DEBUG_ASSERT(data.hasOwnProperty(cLL), "Missing key", cLL);
        DEBUG_ASSERT(typeof(data[cLL]) == "number", "Invalid type for", cLL, typeof(data[cLL]));
        
        aSortedScores.push([cLL, data[cLL]]);
    }

    return aSortedScores.sort((obj1, obj2) => {
        if (obj1[1] < obj2[1])
            return -1;
        else if (obj1[1] > obj2[1])
            return 1;
        return 0;
    }).reverse();
}

/**
 * Creates a shorthand string to visualize the sorted order of the Life Languages for a particular person.
 * @param {array} sortedScores An array of tuples, each tuple contains the name of the Life Language, followed by the score for that Life Language. Typically the output of getSortedScores();
 * @returns {string} Shorthand string suitable for display.
 */
function createShorthandString(sortedScores) {
    let cShorthandString ="";

    DEBUG_ASSERT(typeof(sortedScores) == "object", "sortedScores should be an array", sortedScores, typeof(sortedScores));
   
    
    for (let i = 0; i < sortedScores.length; i++) {
        DEBUG_ASSERT(typeof(sortedScores[i]) == "object", "sortedScores[", i, "] should be an array", i, sortedScores[i], typeof(sortedScores[i]));

        let cKey = sortedScores[i][0];
        DEBUG_ASSERT(typeof(cKey) == "string", "sortedScores[", i, "][0] should be a string", cKey, typeof(cKey));
        DEBUG_ASSERT(LLKEYS.includes(cKey), "sortedScores[", i, "][0] should be a Life Language in LLKEYS", cKey);
        
        let nValue = sortedScores[i][1];
        DEBUG_ASSERT(typeof(nValue) == "number", "sortedScores[", i, "][1] should should be a number", cKey, typeof(cKey));
        
        // Gap indicator
        if (i != 0) {
            let nGap = sortedScores[i - 1][1] - nValue;

            // Normal
            if (nGap >= 5 && nGap <= 10) 
                cShorthandString += "·";
            // Significant gap
            else if (nGap > 10) 
                cShorthandString += "-";
        }
        let c = cKey[0].toUpperCase();
        cShorthandString += nValue >= 50 ? c : c.toLowerCase();
    }
    return cShorthandString;
}

Chart.register(ChartDataLabels);

// Communication indicator colors are gradients or single colors.
const CICOLORS = {
    ACCEPTANCE_LEVEL: ["#D93C4B", "#8D181C"],
    INTERACTIVE_STYLE_INTROVERT: "#2E3192",
    INTERACTIVE_STYLE_BALANCED: ["#2E3192", "#ED1C24"], 
    INTERACTIVE_STYLE_EXTROVERT: "#ED1C24", 
    INTERNAL_CONTROL: ["#F9A150", "#C75B27"],
    INTRUSION_LEVEL: ["#FCD72B", "#DFB825"],
    PROJECTIVE_LEVEL: ["#BCD630", "#2E6933"],
    SUSCEPTIBILITY_TO_STRESS: ["#89D0C3", "#186C66"],
    LEARNING_PREFERENCE_AUDITORY: "#4472C4", 
    LEARNING_PREFERENCE_PHYSICAL: "#FCD72B", 
    LEARNING_PREFERENCE_VISUAL: "#C21E30"
};

/**
 * Creates a color for a particular Communication Indicator.
 * @param {object} ctx Document context to use to create the color.
 * @param {number} nWidth Width in pixels of the gradient to be created.
 * @param {string} cCIC Which communication indicator to get the color for.
 * @returns {object | string} Returns a color string or gradient object.
 */
function createCIColor(ctx, nWidth, cCIC) {
    DEBUG_ASSERT(typeof(ctx) == "object", "ctx should be an object", typeof(ctx));
    DEBUG_ASSERT(typeof(nWidth) == "number", "nWidth should be a number", typeof(nWidth));
    DEBUG_ASSERT(Object.keys(CICOLORS).includes(cCIC), "cCIC should be an entry in CICOLORS", cCIC);

    let entry = CICOLORS[cCIC];
    if (typeof(entry) == "string") {
        return entry;
    }
    
    let g = ctx.createLinearGradient(0, 0, nWidth, 0);
    g.addColorStop(0, entry[0]);
    g.addColorStop(1, entry[1]);
    return g;
}

/**
 * Creates and draws a chart for a particular Communication Indicator.
 * @param {string} elementId The element that will house the chart.
 * @param {string} cTitle The title for the chart.
 * @param {number} nDataValue The score for the Communication Indicator.
 * @param {string} cCIC The key for specifying the color via createCIColor.
 * @param {boolean} bReversed=false If true, chart is displayed left to right, otherwise right to left.
 * @returns {object} Returns the constructed chart object.
 */
function createCIChart(elementId, cTitle, nDataValue, cCIC, bReversed=false) {
    DEBUG_ASSERT(typeof(elementId) == "string", "elementId should be a string", typeof(elementId));
    const canvas = document.getElementById(elementId);
    DEBUG_ASSERT(typeof(canvas) == "object", "Invalid elementId, did not return canvas", elementId);
    canvas.style.width='100%';
    canvas.style.height='100%';
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    DEBUG_ASSERT(typeof(cTitle) == "string", "cTitle is not a string", typeof(cTitle));
    DEBUG_ASSERT(typeof(nDataValue) == "number", "nDataValue is not a number", typeof(nDataValue));
    DEBUG_ASSERT(typeof(cCIC) == "string", "cCIC is not a string", typeof(cCIC));
    
    let options = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "y",
        scales: {
            x: { min: 0, max: 100 },
            y: { beginAtZero: true }
        },
        plugins: { legend: false }
    };
        
    if (bReversed) 
        options.scales.x.reverse = true;
    
    // No data label for a zero score
    if (nDataValue) {
        options.plugins.datalabels = {
            anchor: bReversed ? 'start' : 'end',
            align: bReversed ? 'right' : 'left',
            formatter: Math.round,
            color: 'white',
            font: {
                size: 12,
                weight: "bold"
            }
        };
    }
    
    let chart = new Chart(canvas, {
        type: "bar",
        data: {
            labels: [""],
            datasets: [
                {
                    label: cTitle,
                    data: [ nDataValue ],
                    borderWidth: 1,
                    backgroundColor: createCIColor(canvas.getContext("2d"), canvas.offsetWidth, cCIC), 
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
function evaluateCILevel(nValue, aLevels = [LOW, HIGH], cLevels = ["LOW", "MODERATE", "HIGH"]) {
    DEBUG_ASSERT(typeof aLevels == "object" && aLevels.length == 2);
    DEBUG_ASSERT(typeof cLevels == "object" && cLevels.length == 3);
    if (nValue <= aLevels[0])
        return cLevels[0];
    if (nValue >= aLevels[1])
        return cLevels[2];
    return cLevels[1];
    
}

/**
 * Utility function to determine the appropriate forensics for the Contemplator Acceptance Level
 * @param {nValue} nValue The value to be evaluated.
 * @returns {string} Returns an HTML snippet that shows how the Life Language contributes to the CI.
 */
function acceptanceLevelContemplatorForensics(nValue) {
    if (nValue <= LOW)
        return "<strong>C*</strong>";
    return "c*";
}

/**
 * Utility function to determine the appropriate forensics for the Producer Internal Control
 * @param {nValue} nValue The value to be evaluated.
 * @returns {string} Returns an HTML snippet that shows how the Life Language contributes to the CI.
 */
function internalControlProducerForensics(nValue) {
    // Moderate to High
    if (nValue >= HIGH)
        return "<strong>p</strong>";
    else if (nValue > LOW)
        return "<strong>P</strong>";
    
    return "p";
}

/**
 * Utility function to determine the appropriate forensics for the Contemplator Internal Control
 * @param {nValue} nValue The value to be evaluated.
 * @returns {string} Returns an HTML snippet that shows how the Life Language contributes to the CI.
 */
function internalControlContemplatorForensics(nValue) {
    // Moderate to High
    if (nValue <= LOW)
        return "<strong>C*</strong>";
        
    return "c*";
}

/**
 * Utility function to determine the appropriate forensics for the Shaper Projective Level
 * @param {nValue} nValue The value to be evaluated.
 * @returns {string} Returns an HTML snippet that shows how the Life Language contributes to the CI.
 */
function projectiveLevelShaperForensics(nValue) {
    if (nValue >= HIGH)
        return "<strong>s</strong>";
    else if (nValue >= LOW)
        return "<strong>S</strong>";
    else
        return "s";
}

let forensicsTable = {
    ACCEPTANCE_LEVEL:   { mover: LOW, doer: HIGH, influencer: HIGH, responder: LOW, shaper: HIGH, producer: HIGH , contemplator: acceptanceLevelContemplatorForensics },
    INTERNAL_CONTROL:   { mover: LOW, doer: HIGH, influencer: LOW, responder: LOW, shaper: HIGH, producer: internalControlProducerForensics,  contemplator: internalControlContemplatorForensics },
    INTRUSION_LEVEL:    { mover: LOW, doer: LOW, influencer: HIGH, responder: HIGH, shaper: HIGH, producer: MODERATE, contemplator: HIGH },
    PROJECTIVE_LEVEL:   { mover: LOW, doer: HIGH, influencer: HIGH, responder: HIGH, shaper: projectiveLevelShaperForensics, producer: HIGH, contemplator: LOW }
};

/**
 * Evaluates whether a particular Life Language is contributing to the score for a particular Communication Indicator (except Interactive Style)
 * @param {string} cCI Key for which Communication Indicator to evaluate.
 * @param {string} cLL Key for which Life Language might contribute.
 * @param {number} nValue Value to the Communication Indicator.
 * @returns {string} Returns an HTML snippet that shows how the specified Life Language contributes to the CI.
 */
function evaluateForensicLevel(cCI, cLL, nValue) {
    DEBUG_ASSERT(typeof cCI == "string");
    DEBUG_ASSERT(typeof cLL == "string");
    DEBUG_ASSERT(typeof nValue == "number");
    
    let metric = forensicsTable[cCI][cLL];
    if (typeof metric == "function") {
        return metric(nValue);
    }
        
    if (metric == LOW && nValue <= LOW) {
        return "<strong>" + cLL[0] + "</strong>";
    }
    if (metric == MODERATE && nValue > LOW && nValue < HIGH) {
        return "<strong>" + cLL[0] + "</strong>";
    }
    if (metric == HIGH && nValue >= HIGH) {
        return "<strong>" + cLL[0] + "</strong>";
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
    switch(cLL) {
        case "mover":   // Balanced to Introvert
            if (cISType == "B")
                cContributor = cContributor.toUpperCase();
            if (cISType != "E")
                cContributor = "<strong>" + cContributor + "</strong>";
        break;
        case "doer":    // Introvert
        case "responder":
        case "contemplator":
            if (cISType == "I")
                cContributor = "<strong>" + cContributor.toUpperCase() + "</strong>";

        break;
        case "influencer":  // Extrovert
            if (cISType == "E")
                cContributor = "<strong>" + cContributor.toUpperCase() + "</strong>";
        break;
        case "shaper":      // Balanced
        case "producer":
            if (cISType == "E")
                cContributor = "<strong>" + cContributor.toUpperCase() + "</strong>";
        break;
        default:
            DEBUG_ASSERT(false, "Incorrect Life Language type", cLL);
        break;
    }
    return cContributor;    
}

Chart.register(ChartDataLabels);

/**
 * Main function to draw the Communication Indicators.
 * @param {object} data Data to be displayed.
 */
export function displayCommunicationIndicators(data) {
    let aSortedScores = getSortedScores(data);
    
    document.getElementById("ciname").innerText = data.fullname;
    document.getElementById("cicorp").innerText = data.companyName;
    document.getElementById("cishorthand").innerText = createShorthandString(aSortedScores);
    
    // Hide fornesics if not requested.
    let bHidden = data.showForensics;
    for (let obj of document.getElementsByClassName("CIForensics")) {
        obj.hidden = !bHidden;    
    }
    
    // Charts
    let nValue = data.acceptanceLevel;
    createCIChart("acceptanceLevelChart", "Acceptance Level", nValue, "ACCEPTANCE_LEVEL");
    document.getElementById("alstatus").innerText = evaluateCILevel(nValue, [LOW, HIGH], ["LOW", "MEDIUM", "HIGH"]);
    document.getElementById("alscore").innerText = nValue;
    for (let i = 0; i < aSortedScores.length; i++) {
        let element = document.getElementById("alll" + i);
        element.innerHTML = 
            evaluateForensicLevel("ACCEPTANCE_LEVEL", aSortedScores[i][0], nValue);
    }
        
    let cValue = data.interactiveStyle;
    let cType = cValue[cValue.length-1];
    DEBUG_ASSERT(cType == 'I' || cType == 'B' || cType == 'E', "Interactive Style type must be I, B, or E", cValue);
    nValue = parseFloat(cValue);
    createCIChart("interactiveStyleIntrovertChart", "Introvert", cType == "I" ? nValue : 0, "INTERACTIVE_STYLE_INTROVERT", true);
    createCIChart("interactiveStyleBalancedChart", "Balanced", cType == "B" ? nValue : 0, "INTERACTIVE_STYLE_BALANCED");
    createCIChart("interactiveStyleExtrovertChart", "Extrovert", cType == "E" ? nValue : 0, "INTERACTIVE_STYLE_EXTROVERT");
    document.getElementById("isstatus").innerText = evaluateCILevel(nValue);
    document.getElementById("isscore").innerText = nValue;
    for (let i = 0; i < aSortedScores.length; i++) {
        let element = document.getElementById("isll" + i);
        element.innerHTML = 
            interactiveStyleForensics(aSortedScores[i][0], cType);
    }

    nValue =data.internalControl;
    createCIChart("internalControlChart", "Internal Control", nValue, "INTERNAL_CONTROL");
    document.getElementById("icstatus").innerText = evaluateCILevel(nValue);
    document.getElementById("icscore").innerText = nValue;
    for (let i = 0; i < aSortedScores.length; i++) {
        let element = document.getElementById("icll" + i);
        element.innerHTML = 
            evaluateForensicLevel("INTERNAL_CONTROL", aSortedScores[i][0], nValue);
    }
    
    nValue =data.intrusionLevel;
    createCIChart("intrusionLevelChart", "Intrustion Level", nValue, "INTRUSION_LEVEL");
    document.getElementById("ilstatus").innerText = evaluateCILevel(nValue);
    document.getElementById("ilscore").innerText = nValue;
    for (let i = 0; i < aSortedScores.length; i++) {
        let element = document.getElementById("illl" + i);
        element.innerHTML = 
            evaluateForensicLevel("INTRUSION_LEVEL", aSortedScores[i][0], nValue);
    }

    nValue = data.projectiveLevel;
    createCIChart("projectiveLevelChart", "Projective Level", nValue, "PROJECTIVE_LEVEL");
    document.getElementById("plstatus").innerText = evaluateCILevel(nValue);
    document.getElementById("plscore").innerText = nValue;
    for (let i = 0; i < aSortedScores.length; i++) {
        let element = document.getElementById("plll" + i);
        element.innerHTML = 
            evaluateForensicLevel("PROJECTIVE_LEVEL", aSortedScores[i][0], nValue);
    }

    nValue = data.susceptibilityToStress;
    createCIChart("susceptiblityToStressChart", "Susceptibility To Stress", nValue, "SUSCEPTIBILITY_TO_STRESS");
    document.getElementById("ssstatus").innerText = evaluateCILevel(nValue);
    document.getElementById("ssscore").innerText = nValue;
    
    createCIChart("learningPreferenceAuditoryChart", "Auditory", data.learningPreferenceAuditory, "LEARNING_PREFERENCE_AUDITORY");
    createCIChart("learningPreferenceVisualChart", "Visual", data.learningPreferenceVisual, "LEARNING_PREFERENCE_VISUAL");
    createCIChart("learningPreferencePhysicalChart", "Physical", data.learningPreferencePhysical, "LEARNING_PREFERENCE_PHYSICAL");
    nValue = data.learningPreferenceAuditory;
    document.getElementById("lpstatus").innerText = evaluateCILevel(nValue);
    document.getElementById("lpscore").innerText = nValue;
    nValue = data.learningPreferenceVisual;
    document.getElementById("lpll2").innerText = evaluateCILevel(nValue);
    document.getElementById("lpll3").innerText = nValue;
    nValue = data.learningPreferencePhysical;
    document.getElementById("lpll5").innerText = evaluateCILevel(nValue);
    document.getElementById("lpll6").innerText = nValue;

    // Handle printing events.
    window.addEventListener('beforeprint', (event) => {
        let collection = document.getElementsByClassName("PrintFull");
        for(let i = 0; i < collection.length; i++) {
            const chart = collection.item(i);
            // 1101 is a complete hack for Letter size paper.
            Chart.getChart(chart).resize(1101, 75);
        }
        collection = document.getElementsByClassName("PrintOneThird");
        for(let i = 0; i < collection.length; i++) {
            const chart = collection.item(i);
            // 1101 is a complete hack for Letter size paper.
            Chart.getChart(chart).resize(1101/3, 75);
        }
    });
    
    window.addEventListener('afterprint', (event) => {
        for (let id in Chart.instances) {
            let chart = Chart.instances[id];
            chart.resize();
        }
    });
}
