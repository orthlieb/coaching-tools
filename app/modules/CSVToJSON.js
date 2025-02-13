/**
 * Useful routines to convert to/from CSV from/to JSON.
 * @author Carl Orthlieb
 * @namespace CSV
 */

import { ERROR } from './Error.js';
import { DEBUG } from './Debug.js';

export const CSV = {
    /**
     * Parse a CSV string and convert to JSON object.
     * @param {string} csvText Text string containing the CSV.
     * @returns {object} JSON object parsed from CSV.
     * @throws If incoming parameter is not a string.
     */
    toJSON: function (csvText) {
         ERROR.assertType(csvText, 'string', 'CSV.toJSON parameter csvText');

        const rows = csvText.split('\n');

        // Initialize an array to store parsed data
        const data = [];

        // Regular expression for matching CSV fields
        const fieldRegex = /(?:,"(.*?)")|([^,"]+)/g;

        // Iterate over each row
        let headers;
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i].trim();
            if (!row) continue; // Skip empty lines

            let currentRow = [];
            let match;

            // Iterate over each match of the fieldRegex in the row
            while ((match = fieldRegex.exec(row)) !== null) {
                const fieldValue = match[1] || match[2] || ''; // Use captured group 1 if available, otherwise captured group 2
                currentRow.push(fieldValue);
            }

            // Create an object from the row using headers as keys
            if (i == 0) {
                headers = [...currentRow];
                DEBUG.log(`CSV.toJSON There are ${headers.length} keys ${JSON.stringify(headers)}`);
            } else {
                const rowObject = {};
                for (let k = 0; k < headers.length; k++) {
                    rowObject[headers[k]] = currentRow[k] || ''; // Handle missing fields
                }

                // Add the row object to the data array
                data.push(rowObject);
            }
        }

        return data;
    },

    /**
     * Convert an object to a CSV string.
     * @param data {object} Object to convert to CSV, you can pass in an array of objects as well (typical)
     * @returns {string} Converted CSV as a string.
     */

    fromJSObject: function (data) {
        // Check if input is an array or a single object, we deal in arrays
        const dataArray = Array.isArray(data) ? data : [data];

        // Extract headers from the first object (or the single object)
        const headers = Object.keys(dataArray[0]);

        // Create CSV header row
        const headerRow =
            headers.map((header) => `"${header.replace(/"/g, '""')}"`).join(",") +
            "\n";

        // Create CSV data rows
        const dataRows = dataArray
            .map((obj) => {
                return headers
                    .map((header) => {
                        const value = obj[header];
                        if (typeof value === "string") {
                            // Escape special characters in string values
                            let escapedValue = value.replace(/"/g, '""'); // Double quotes
                            escapedValue = `"${escapedValue}"`; // Enclose in double quotes
                            return escapedValue;
                        }
                        return value;
                    })
                    .join(",");
            })
            .join("\n");

        // Combine header row and data rows
        const csv = headerRow + dataRows;

        return csv;
    }
};
