import fs from "fs";
import path from "path";
import { glob } from "glob";
import { fileURLToPath } from "url";
import { minify as terserMinify } from "terser";
import { minify as cssoMinify } from "csso";

// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_DIR = path.join(__dirname, "../app");
const PROD_DIR = path.join(__dirname, "../prod");

// Files we never ship to production. Test fixtures and the random-name generator stay
// out of the deployment so we don't leak fake names/companies in the bundle and don't
// give clients a "?no-params" path that auto-generates content.
const PROD_EXCLUDE_GLOBS = [
    "modules/test/**",
    "modules/Test.js",
];

// Source-map artifacts can leak file paths and bloat the bundle.
const ALWAYS_EXCLUDE = [
    "**/*.map",
];

(async () => {
    try {
        console.log("🚀 Starting production build...");

        // Step 1: Remove existing prod directory
        if (fs.existsSync(PROD_DIR)) {
            fs.rmSync(PROD_DIR, { recursive: true, force: true });
        }
        fs.mkdirSync(PROD_DIR, { recursive: true });

        // Step 2: Copy app/ → prod/, excluding test fixtures and source maps
        const files = glob.sync("**/*", {
            cwd: SOURCE_DIR,
            nodir: true,
            ignore: [...PROD_EXCLUDE_GLOBS, ...ALWAYS_EXCLUDE],
        });
        await Promise.all(files.map(async (file) => {
            const srcPath = path.join(SOURCE_DIR, file);
            const destPath = path.join(PROD_DIR, file);

            fs.mkdirSync(path.dirname(destPath), { recursive: true });
            fs.copyFileSync(srcPath, destPath);
        }));

        console.log(`✅ Copied ${files.length} files to prod/ (test fixtures excluded)`);

        // Step 3: Set `bEnable: false` in `Debug.js` so console logging is off in prod.
        // The replacement is permissive on whitespace because hand-edits sometimes drift.
        const debugFilePath = path.join(PROD_DIR, "modules", "Debug.js");
        if (fs.existsSync(debugFilePath)) {
            let debugContent = fs.readFileSync(debugFilePath, "utf-8");
            const before = debugContent;
            debugContent = debugContent.replace(/bEnable\s*:\s*true/g, "bEnable: false");
            if (debugContent === before) {
                throw new Error("Debug.js: failed to flip bEnable to false (regex didn't match)");
            }
            fs.writeFileSync(debugFilePath, debugContent);
            console.log("✅ Updated Debug.js: Set bEnable: false");
        }

        // Step 4: Strip the test-data fallback from each HTML page. Pattern:
        //
        //     // BEGIN-TEST-FALLBACK (dev only)
        //     ...anything...
        //     // END-TEST-FALLBACK
        //
        // The bootstrap helper interprets the absence of these markers as "no-params is
        // a hard error in prod" rather than "auto-generate fake data."
        const htmlFiles = glob.sync("*.html", { cwd: PROD_DIR, absolute: true });
        for (const filePath of htmlFiles) {
            let html = fs.readFileSync(filePath, "utf-8");
            const before = html;
            html = html.replace(
                /\s*\/\/\s*BEGIN-TEST-FALLBACK[\s\S]*?\/\/\s*END-TEST-FALLBACK/g,
                "",
            );
            if (html !== before) {
                fs.writeFileSync(filePath, html);
                console.log(`✅ Stripped test-fallback block: ${path.basename(filePath)}`);
            }
        }

        // Step 5: Minify all JavaScript files
        const jsFiles = glob.sync("**/*.js", { cwd: PROD_DIR, ignore: ["**/*.min.js"], absolute: true });

        await Promise.all(jsFiles.map(async (filePath) => {
            try {
                const code = fs.readFileSync(filePath, "utf-8");
                const minified = await terserMinify(code, { module: true });

                if (minified.code) {
                    fs.writeFileSync(filePath, minified.code);
                } else {
                    throw new Error(`Minification produced no output`);
                }
            } catch (error) {
                throw new Error(`❌ Minification failed for ${filePath}: ${error.message}`);
            }
        }));
        console.log(`✅ Minified ${jsFiles.length} JS files`);

        // Step 6: Minify all CSS files in `prod/styles/`
        const cssFiles = glob.sync("styles/**/*.css", { cwd: PROD_DIR, absolute: true });

        await Promise.all(cssFiles.map(async (filePath) => {
            try {
                const css = fs.readFileSync(filePath, "utf-8");
                const minifiedCss = cssoMinify(css).css;
                fs.writeFileSync(filePath, minifiedCss);
            } catch (error) {
                throw new Error(`❌ CSS Minification failed for ${filePath}: ${error.message}`);
            }
        }));
        console.log(`✅ Minified ${cssFiles.length} CSS files`);

        console.log("✅ Production build completed!");
        process.exit(0);
    } catch (error) {
        console.error(`❌ Build failed!`, error);
        process.exit(1);
    }
})();
