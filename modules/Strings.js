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
        fullName: 'Name',
        overallIntensityColumn: 'OI',
        overallIntensity: 'Overall Intensity',
        columnVisibility: 'Life Languages'
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
     * Set of labels for score ratings. 
     */
    scoreLabels: [ 'Very Low', 'Low', 'Moderate', 'High', 'Very High'],
    
    gap: {
        basic: 'Gap is the distance from one Life Language to the next Language in your KLLP. For example, if your Responder score is 70 and your Doer score is 60, those two Languages have a Gap of 10. The greater the Gap, the more effort or intention it takes to move from speaking one Life Language to the other. The smaller the Gap, the easier it is to move between the two Life Languages and the greater responsibility one has to be clear when communicating and shifting from one Life Language to another.'
    },
    
    /**
     * Set of explanatory text for ranges.
     */
    range: {
        pre: 'Range is the difference or distance between your Primary and Seventh Life Languages. Add up the Gap scores between each Language (or subtract the 7th Language score from the 1st Language score) to find your total Range. You will also want to note the Gap score between each Language and how the Range increases with each descending Language to give you the above score.',
        moderate: 'Your Range score is considered Moderate.',
        high: 'Your Range score is considered High.',
        post: 'A high or low score is neither better nor worse, though very meaningful. A High Range means that you tend to stand out in your Primary Language and have a more definable behavior and communication style. However, you may have more difficulty communicating with those who speak your weaker Languages. Someone with a Low Range might be able to communicate easily with all the Languages, but may be less predictable and understandable to others, and sometimes even to themselves. The failure to understand Range is one of the primary causes of communication difficulties.'
    },
    
    /**
     * Set of explanatory text for overall intensity.
     */
    overallIntensity: {
        basic: 'Your Intensity score reveals the strength, energy, and passion you have for communication. The higher your Intensity, the higher your drive to communicate and the more effort you put into it.',
        high: 'Your Intensity Level is High. High Intensity often means you will fight for your opinion to be considered and to exercise control (whether directly or indirectly). You will do more to maintain communication and relationships. You may also be more prone to conflict. People with High Intensity tend to draw attention. People with Low Intensity generally do not compete to be heard, although they may have valuable contributions to make and are sometimes overlooked or ignored.',
    }
    
    
};
