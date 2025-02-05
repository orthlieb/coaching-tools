/**
 * Common object with useful common routines and keys for Life Languages
 * @author Carl Orthlieb
 * @namespace COMMON
 */

import { ERROR } from './Error.js';
import { DEBUG } from './Debug.js';

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
    /**
     * Colors for each of the Life Languages by key.
     * @description COMMON.colors.solid[llKey] to get a solid color for that Life Language.
     * COMMON.colors.light[llKey] to get a lighter version of the color for that Life Language.
     * COMMON.colors.dark[llKey] to get a darker version of the color for that Life Language. Typically used for text colors.
     * COMMON.colors.background[llKey] to get a semi-transparent background color for that Life Language.
     */
    colors: {
        solid: {
            mover: 'hsl(358, 85%, 52%)', 
            doer: 'hsl(28, 92%, 54%)', 
            influencer: 'hsl(48, 100%, 52%)', 
            responder: 'hsl(274, 54%, 41%)',
            shaper: 'hsl(218, 52%, 52%)', 
            producer: 'hsl(152, 100%, 20%)', 
            contemplator: 'hsl(196, 73%, 54%)'
        },
        light: {
            mover: 'hsl(358, 85%, 90%)',
            doer: 'hsl(28, 92%, 92%)',
            influencer: 'hsl(48, 100%, 90%)',
            responder:' hsl(274, 54%, 90%)',    
            shaper:' hsl(218, 52%, 90%)',
            producer: 'hsl(151, 26%, 84%)',
            contemplator: 'hsl(196, 73%, 92%)'
        },
        dark: {
            mover: 'hsl(358, 85%, 32%)', 
            doer: 'hsl(28, 92%, 34%)', 
            influencer: 'hsl(48, 100%, 32%)', 
            responder: 'hsl(274, 54%, 21%)',
            shaper: 'hsl(218, 52%, 32%)', 
            producer: 'hsl(152, 100%, 15%)', 
            contemplator: 'hsl(196, 73%, 34%)'
        },
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
    
    /**
     * Colors for each of the Life Languages by key.
     * @description COMMON.colors.solid[llKey] to get a solid color for that Life Language.
     */
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
     * Creates an info dialog attached to a particular element.
     * @param {object|string} infoElement Either a element or the id of an element.
     * @param {string} cTitle Title of the dialog.
     * @param {string} cBody Body of the dialog.
     * @public
     */
    createInfoDialog(infoElement, cTitle, cBody) {
        //DEBUG.logArgs('Common.createInfoDialog(cInfoId, cTitle, cBody)', arguments);
        
        if (typeof infoElement == 'string')
            infoElement = document.getElementById(infoElement);
        
        infoElement.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent default anchor behavior

            // Populate the modal title and body content
            document.getElementById('modal-title').innerHTML = cTitle;
            document.querySelector('#modal-dialog .modal-body').innerHTML = cBody;
            
            // Show the modal programmatically
            const myModal = bootstrap.Modal.getInstance(document.getElementById('modal-dialog')) ||
                new bootstrap.Modal(document.getElementById('modal-dialog'));            
            myModal.show();
        });
    },
    
    /**
     * Creates an alert inside a document by cloning a div with the id 'alert' and prepending it to the document and revealing it.
     * @param {string} message Message to be displayed.
     * @param {string} alertType One of 'alert-danger', alert-warning', 'alert-success', or 'alert-custom'
     * @param {string} alertCustom Custom HTML to use for an icon.
     * @public
     */
    displayAlertInDoc(message, alertType = 'alert-danger', alertCustom = null) {
        DEBUG.logArgs("COMMON.displayAlertInDoc(message, alertType = 'alert-danger', alertCustom = null)", arguments);

        // Find out who called us.
        const stack = new Error().stack.split("\n");
        const callerInfo = stack[2].trim().match(/at (\S+) \((.*):(\d+):(\d+)\)/);
        let callerStr = "Unknown caller";
        if (callerInfo) {
            const [, functionName, file, line, col] = callerInfo;
            callerStr = `${functionName} (${file}:${line}:${col})`;
        }
        
        let icons = {
            "alert-danger": '<i class="fa-solid fa-diamond-exclamation me-3 fs-3"></i>',
            "alert-warning": '<i class="fa-solid fa-triangle-exclamation me-3 fs-3"></i>',
            "alert-success": '<i class="fa-solid fa-square-check me-3 fs-3"></i>',
            "alert-info": '<i class="fa-solid fa-circle-info me-3 fs-3"></i>',
            "alert-custom": alertCustom
        };

        // Create the alert dynamically
        const newAlert = document.createElement('div');
        newAlert.className = `alert alert-dismissible d-flex align-items-center m-3 ${alertType}`;
        newAlert.setAttribute('role', 'alert');

        // Add the icon, message, and close button
        const iconHTML = icons[alertType] || '';
        newAlert.innerHTML = `
            ${iconHTML} ${callerInfo} ${message}
            <button type="button" class="btn-close m-3" data-bs-dismiss="alert" aria-label="Close">
                <i class="fa-solid fa-circle-xmark" style="color: inherit;"></i>
            </button>
        `;
        // Prepend the new alert to the body
        document.body.prepend(newAlert);

        // Automatically remove the alert when the close button is clicked
        newAlert.querySelector('.btn-close').addEventListener('click', () => newAlert.remove());
    },
    
    /**
     * Parse parameters an array containing objects with the supplied template.
     * @param {array} Array to process.
     * @param {object} Template containing keys to parse for and parsing functions.
     * @returns {object} Parsed parameters.
     */
    parseParameters(params, parseKeys) {
        DEBUG.logArgs('Common.parseParameters(params, parseKeys)', arguments);
        // Parse all the parameters, CSV and forms have strings for numbers, we need to convert them.
        let parseFunctions = {
            string: (key, value) => value,
            number: (key, value) => {
                if (typeof value == "number")
                    return value;
                let nValue = parseFloat(value);
                if (Number.isNaN(nValue)) 
                    return value;
                return nValue;
            },
            character: (key, value) => {
                if (typeof value == 'string')
                    return value[0];
                return value;
            },
            boolean: (key, value) => {
                if (typeof value == 'boolean')
                    return value;
                if (typeof value == 'string') {
                    let cValue = value[0].toLowerCase();
                    return cValue == "y" || cValue == "t" || cValue == "1";
                }
                return value == 1;
            }
        };

        let parsedParams = [];
        params.forEach(param => {
            let obj = {};
            Object.keys(parseKeys).forEach(key => {
                if (param[key])
                    obj[key] = parseFunctions[parseKeys[key]](key, param[key]);       
            }); 
            parsedParams.push(obj);
        });
        
        return parsedParams;
    },
    
    showLoading(id) {
        document.getElementById('loading').style.display = 'flex';
        document.getElementById(id).style.display = 'none';
    },

    hideLoading(id) {
        document.getElementById(id).style.display = 'block';
        document.getElementById('loading').style.display = 'none';
    }
};



