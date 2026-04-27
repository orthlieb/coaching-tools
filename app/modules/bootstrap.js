/*
 * @module modules/bootstrap
 * @author Carl Orthlieb
 *
 * One helper that owns every HTML page's boot sequence:
 *  1. Wait for localization to load.
 *  2. Read params from the URL (?json=… | ?csv=… | flat key/value).
 *  3. If no params and a dev test fallback is provided, run it. Otherwise show an alert.
 *  4. Coerce strings → typed values via COMMON.parseParameters.
 *  5. Hand the result to the page-specific `mount` function.
 *
 * Build-prod strips the test fallback block from each HTML page (see scripts/build-prod.mjs)
 * so production deployments don't ship random-data generation or the Test.js name lists.
 */

import { COMMON } from "./Common.js";
import { CSV } from "./CSVToJSON.js";
import { DEBUG } from "./Debug.js";
import { LocalizationReady } from "./Strings.js";

/**
 * Boot a coaching-tool page.
 *
 * @param {object} options
 * @param {string} options.loadingId  HTML id of the element to hide while loading.
 * @param {object} options.parseKeys  COMMON.parseParameters schema for this page.
 * @param {(params: object|object[]) => void} options.mount  Page-specific renderer.
 * @param {() => Promise<URL>} [options.testFallback]  Optional dev-only test data generator.
 *        Returns a URL containing the test data; only invoked when no params are in the live URL.
 */
export async function bootstrapPage({ loadingId, parseKeys, mount, testFallback }) {
    try {
        COMMON.showLoading(loadingId);
        await LocalizationReady;
        COMMON.hideLoading(loadingId);

        let url = new URL(window.location.href);
        let params = await readParams(url, testFallback);

        // Single-object payloads are wrapped so downstream code only deals with arrays.
        if (!Array.isArray(params)) params = [params];

        const parsed = COMMON.parseParameters(params, parseKeys);
        mount(parsed);
    } catch (e) {
        DEBUG.log(e);
        COMMON.displayAlertInDoc(e.message || String(e));
    }
}

/**
 * Resolve params from the URL, falling back to dev test data when no inputs are present.
 * In production builds the test fallback is stripped at build time, so missing params throw.
 * @private
 */
async function readParams(url, testFallback) {
    const sp = url.searchParams;

    if (sp.has("json")) return JSON.parse(sp.get("json"));
    if (sp.has("csv"))  return CSV.toJSON(sp.get("csv"));

    // Flat key=value form (used by older share URLs and form posts).
    const flat = {};
    let hasFlat = false;
    for (const [key, value] of sp.entries()) {
        hasFlat = true;
        flat[key] = value;
    }
    if (hasFlat) return flat;

    // No params at all. Use the test fallback if provided (dev only).
    if (typeof testFallback === "function") {
        DEBUG.log("No data specified, generating test data");
        const testUrl = await testFallback();
        const testSp = testUrl.searchParams;
        if (testSp.has("json")) return JSON.parse(testSp.get("json"));
        if (testSp.has("csv"))  return CSV.toJSON(testSp.get("csv"));
    }

    throw new Error(
        "No data provided. Pass JSON via ?json=…, CSV via ?csv=…, or individual fields as URL parameters.",
    );
}
