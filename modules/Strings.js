/*
 * @module modules/Strings
 * @author Carl Orthlieb
 */

/**
 * Common object with useful common routines and keys for Life Languages.
 */
export const STRINGS = {
    language: 'en',
    
    general: {
        columnVisibility: 'Life Languages',
        overallIntensity: 'Overall Intensity',
        range: 'Range',
        gap: 'Gap',
        low: 'Low',
        high: 'High'
    },
 
    /**
     * Labels to use for Life Languages by key.
     */
    labels: {
        mover: 'Mover',
        doer: 'Doer',
        influencer: 'Influencer',
        responder: 'Responder',
        shaper: 'Shaper',
        producer: 'Producer',
        contemplator: 'Contemplator'
    },

    /**
     * Set of labels for column headings for the person Life Language table.
     */
    columnLabels: ['', 'Full Name', 'M', 'D', 'I', 'R', 'S', 'P', 'C', 'OI'],
    columnTitles: ['', 'Full Name', 'Mover', 'Doer', 'Influencer', 'Responder', 'Shaper', 'Producer', 'Contemplator', 'Overall Intensity'],
    
    /**
     * Set of labels for column headings for the person Communicaton indicators.
     */
    columnCILabels: ['', 'Full Name', 'AL', 'IS', 'IC', 'IL', 'PL', 'SS', 'LPA', 'LPV', 'LPP' ],
    
    /**
     * Set of labels for score ratings. 
     */
    scoreLabels: [ 'Very Low', 'Low', 'Moderate', 'High', 'Very High'],
    
    gap: {
        pre: '<p>Gap is the distance from one Life Language to the next Language in your profile. The greater the Gap, the more effort or intention it takes to move from speaking one Life Language to the other. The smaller the Gap, the easier it is to move between the two Life Languages and the greater responsibility one has to be clear when communicating and shifting from one Life Language to another.<p>',
        info: [
            '<p>Your gap between these two languages is considered to be <i>Low</i> or compressed. You may unconsciously switch between these two languages without signalling, potentially causing confusion with those you are communicating with.</p>',
            '<p>Your gap between these two languages is considered to be <i>Moderate</i>, you can switch easily between these two languages and will likely signal to those you are communicating with that you are switching languages.</p>',
            '<p>Your gap between these two languages is considered to be <i>High</i>, you may need to consciously decide to switch between these two languages.</p>'
        ],
        post: ''
    },
    
    /**
     * Set of explanatory text for ranges.
     */
    range: {
        pre: '<p>Range is the difference or distance between your Primary and Seventh Life Languages. Add up the Gap scores between each Language (or subtract the 7th Language score from the 1st Language score) to find your total Range. You will also want to note the Gap score between each Language and how the Range increases with each descending Language to give you the above score.</p>',
        info: [
            '<p>Your Range score is considered <i>Very Low.</i></p>',
            '<p>Your Range score is considered <i>Low.</i></p>',
            '<p>Your Range score is considered <i>Moderate.</i></p>',
            '<p>Your Range score is considered <i>High.</i></p>',
            '<p>Your Range score is considered <i>Very High.</i></p>'
         ],
        post: '<p>A high or low score is neither better nor worse, though very meaningful. A High Range means that you tend to stand out in your Primary Language and have a more definable behavior and communication style. However, you may have more difficulty communicating with those who speak your weaker Languages. Someone with a Low Range might be able to communicate easily with all the Languages, but may be less predictable and understandable to others, and sometimes even to themselves. The failure to understand Range is one of the primary causes of communication difficulties.</p>'
    },
    
    /**
     * Set of explanatory text for overall intensity.
     */
    overallIntensity: {
        pre: '<p>Your Intensity score reveals the strength, energy, and passion you have for communication. The higher your Intensity, the higher your drive to communicate and the more effort you put into it.</p>',
        info: [
            '<p>Your Intensity Level is <i>Very Low.</i></p>',
            '<p>Your Intensity Level is <i>Low.</i></p>',
            '<p>Your Intensity Level is <i>Moderate.</i></p>',
            '<p>Your Intensity Level is <i>High.</i> </p>',
            '<p>Your Intensity Level is <i>Very High. </i></p>'
        ],
        post: '<p>People with High Intensity often fight for their opinion to be considered and to exercise control (whether directly or indirectly). They will do more to maintain communication and relationships. They may also be more prone to conflict. People with High Intensity tend to draw attention. People with Low Intensity generally do not compete to be heard, although they may have valuable contributions to make and are sometimes overlooked or ignored.</p>'
    }
};
