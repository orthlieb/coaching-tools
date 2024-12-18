/*
 * @module modules/Common
 * @author Carl Orthlieb
 */

/**
 * Common object with useful common routines and keys for Life Languages.
 */
export const COMMON = {
    /**
     * Keys to use for Life Languages. 
     */
    llKeys: [
        'mover',
        'doer',
        'influencer',
        'responder',
        'shaper',
        'producer',
        'contemplator'
    ],
    colors: {
        /**
         * Colors for each of the Life Languages by key.
         */
        solid: {
            mover: 'hsl(358, 85%, 52%)', 
            doer: 'hsl(28, 92%, 54%)', 
            influencer: 'hsl(48, 100%, 52%)', 
            responder: 'hsl(274, 54%, 41%)',
            shaper: 'hsl(218, 52%, 52%)', 
            producer: 'hsl(152, 100%, 20%)', 
            contemplator: 'hsl(196, 73%, 54%)'
        },

        /**
         * Lighter version of colors to be used as backgrounds by key.
         */
        light: {
            mover: 'hsl(358, 85%, 90%)',
            doer: 'hsl(28, 92%, 92%)',
            influencer: 'hsl(48, 100%, 90%)',
            responder:' hsl(274, 54%, 90%)',    
            shaper:' hsl(218, 52%, 90%)',
            producer: 'hsl(151, 26%, 84%)',
            contemplator: 'hsl(196, 73%, 92%)'
        },
        
        /**
         * Darker version of colors to be used as text colors. Access via COMMON.colors.dark[key].
         */
        dark: {
            mover: 'hsl(358, 85%, 32%)', 
            doer: 'hsl(28, 92%, 34%)', 
            influencer: 'hsl(48, 100%, 32%)', 
            responder: 'hsl(274, 54%, 21%)',
            shaper: 'hsl(218, 52%, 32%)', 
            producer: 'hsl(152, 100%, 15%)', 
            contemplator: 'hsl(196, 73%, 34%)'
        },
       /**
        * Background colors that include a level of transparency. Access via COMMON.colors.background[key].
        */
        background: {
            mover: 'hsla(358, 85%, 32%, 0.2)',
            doer: 'hsla(28, 92%, 54%, 0.2)',
            influencer: 'hsla(48, 100%, 52%, 0.2)',
            responder: 'hsla(274, 54%, 41%, 0.2)',
            shaper: 'hsla(218, 52%, 52%, 0.2)',
            producer: 'hsla(152, 100%, 15%, 0.2)',
            contemplator: 'hsla(196, 73%, 34%, 0.2)'
        }
    },
    /**
     * Set of keys for Communication Indicators.
     */
    ciKeys: [
        'acceptanceLevel',
        'interactiveStyle',
        'internalControl',
        'intrusionLevel',
        'projectiveLevel',
        'susceptibilityToStress',
        'learningPreferenceAuditory',
        'learningPreferenceVisual',
        'learningPreferencePhysical'
    ],
    
    ciColors: {
        solid: {
            acceptanceLevel: 'hsl(356, 69%, 43%)',
            interactiveStyle: 'hsl(298, 68.5%, 45%)',
            internalControl: 'hsl(24.5, 80%, 56%)',
            intrusionLevel:  'hsl(48, 85.5%, 54.5%)',
            projectiveLevel: 'hsl(97, 53%, 40.5%)',
            susceptibilityToStress: 'hsl(172.5, 53.5%, 47%)',
            learningPreferenceAuditory: "hsl(218, 52%, 52%)",
            learningPreferencePhysical: "hsl(49, 97%, 58%)",
            learningPreferenceVisual: "hsl(353, 73%, 44%)",
        }
    },
    
    /**
     * Evaluates whether Score is VERY LOW, LOW, MODERATE, HIGH or VERY HIGH.
     * Suitable for displaying arrows or colors from another array.
     * @param {number} nValue The value to be evaluated.
     * @returns {number} Returns an integer between 0 and 4 suitable for indexing into an array.
     */
    evaluateScoreLevel: function(nValue) {
        if (nValue < 15) return 0;      // bi-arrow-down "\D83E\DC7B"; "&#x1F87B;";  down
        else if (nValue < 35) return 1; // bi-arrow-down-right "&#x1F87E;"; down-right
        else if (nValue < 65) return 2; // bi-arrow-right "&#x1F87A;"; right
        else if (nValue < 85) return 3; // bi-arrow-up-right "&#x1F87D;"; up-right
    
        return 4;                       // bi-arrow-up score-arrow "\D83E\DC70"; "&#x1F879;"; up
    },

    /**
     * Creates an info dialog attached to a particular element.
     * @param {string} cInfoId The id of the element to attach the dialog.
     * @param {string} cTitle Title of the dialog.
     * @param {string} cBody Body of the dialog.
     */
    createInfoDialog(cInfoId, cTitle, cBody) {
        document.getElementById(cInfoId).addEventListener('click', function(event) {
            event.preventDefault(); // Prevent default anchor behavior

            // Populate the modal title and body content
            document.getElementById('modal-title').innerHTML = cTitle;
            document.querySelector('#modal-dialog .modal-body').innerHTML = cBody;
            
            // Show the modal programmatically
            const myModal = bootstrap.Modal.getInstance(document.getElementById('modal-dialog')) ||
                new bootstrap.Modal(document.getElementById('modal-dialog'));            
            myModal.show();
        });
    }
};


