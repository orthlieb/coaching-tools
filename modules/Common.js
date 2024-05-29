export const LLKEYS = [
    'mover',
    'doer',
    'influencer',
    'responder',
    'shaper',
    'producer',
    'contemplator'
];

export const LLLABELS = {};
LLKEYS.forEach(key => LLLABELS[key] = key.charAt(0).toUpperCase() + key.slice(1));

export const LLCOLORS = {
    mover: 'hsl(358, 85%, 52%)', 
    doer: 'hsl(28, 92%, 54%)', 
    influencer: 'hsl(48, 100%, 52%)', 
    responder: 'hsl(274, 54%, 41%)',
    shaper: 'hsl(218, 52%, 52%)', 
    producer: 'hsl(152, 100%, 20%)', 
    contemplator: 'hsl(196, 73%, 54%)'
};

export const LLCOLORS_LIGHT = {
    mover: 'hsl(358, 85%, 90%)',
    doer: 'hsl(28, 92%, 92%)',
    influencer: 'hsl(48, 100%, 90%)',
    responder:' hsl(274, 54%, 90%)',    
    shaper:' hsl(218, 52%, 90%)',
    producer: 'hsl(151, 26%, 84%)',
    contemplator: 'hsl(196, 73%, 92%)'
};

export const LLCOLORS_DARK = {
    mover: 'hsl(358, 85%, 32%)', 
    doer: 'hsl(28, 92%, 34%)', 
    influencer: 'hsl(48, 100%, 32%)', 
    responder: 'hsl(274, 54%, 21%)',
    shaper: 'hsl(218, 52%, 32%)', 
    producer: 'hsl(152, 100%, 15%)', 
    contemplator: 'hsl(196, 73%, 34%)'
};

export const LLCOLORS_BACKGROUND = {
    mover: 'hsla(358, 85%, 32%, 0.2)',
    doer: 'hsla(28, 92%, 54%, 0.2)',
    influencer: 'hsla(48, 100%, 52%, 0.2)',
    responder: 'hsla(274, 54%, 41%, 0.2)',
    shaper: 'hsla(218, 52%, 52%, 0.2)',
    producer: 'hsla(152, 100%, 15%, 0.2)',
    contemplator: 'hsla(196, 73%, 34%, 0.2)'
};

export const CIKEYS = [
    'acceptanceLevel',
    'interactiveStyleScore',
    'interactiveStyleType',
    'internalControl',
    'intrusionLevel',
    'projectiveLevel',
    'susceptibilityToStress',
    'learningPreferenceAuditory',
    'learningPreferenceVisual',
    'learningPreferencePhysical'
];

export const COMMON = {
   /**
     * Evaluates whether Score is VERY LOW, LOW, MODERATE, HIGH or VERY HIGH.
     * @param {number} nValue The value to be evaluated.
     * @returns {number} Returns an integer between 0 and 4 suitable for indexing into an array.
     */
    evaluateScoreLevel: function(nValue) {
        if (nValue < 15) return 0;      // bi-arrow-down "\D83E\DC7B"; "&#x1F87B;";  down
        else if (nValue < 35) return 1; // bi-arrow-down-right "&#x1F87E;"; down-right
        else if (nValue < 65) return 2; // bi-arrow-right "&#x1F87A;"; right
        else if (nValue < 85) return 3; // bi-arrow-up-right "&#x1F87D;"; up-right
        return 4;                       // bi-arrow-up score-arrow "\D83E\DC70"; "&#x1F879;"; up
    }
};

