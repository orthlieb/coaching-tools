import fs from "fs";
import path from "path";
import { glob } from "glob";
import { fileURLToPath } from "url";
import { minify as terserMinify } from "terser";
import { minify as cssoMinify } from "csso"; // ✅ Corrected import

// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_DIR = path.join(__dirname, "../app");
const PROD_DIR = path.join(__dirname, "../prod");

(async () => {
    try {
        console.log("🚀 Starting production build...");

        // Step 1: Remove existing prod directory
        if (fs.existsSync(PROD_DIR)) {
            fs.rmSync(PROD_DIR, { recursive: true, force: true });
        }
        fs.mkdirSync(PROD_DIR, { recursive: true });

        // Step 2: Copy all files from `app/` to `prod/`
        const files = glob.sync("**/*", { cwd: SOURCE_DIR, nodir: true });
        await Promise.all(files.map(async (file) => {
            const srcPath = path.join(SOURCE_DIR, file);
            const destPath = path.join(PROD_DIR, file);

            fs.mkdirSync(path.dirname(destPath), { recursive: true });
            fs.copyFileSync(srcPath, destPath);
        }));

        console.log("✅ Copied all files to prod/");

        // Step 3: Set `bEnable: false` in `Debug.js`
        const debugFilePath = path.join(PROD_DIR, "modules", "Debug.js");
        if (fs.existsSync(debugFilePath)) {
            let debugContent = fs.readFileSync(debugFilePath, "utf-8");

            // ✅ Correct replacement: `bEnable: true` → `bEnable: false`
            debugContent = debugContent.replace(/bEnable:\s*true/g, "bEnable: false");

            fs.writeFileSync(debugFilePath, debugContent);
            console.log("✅ Updated Debug.js: Set bEnable: false");
        }

        // Step 4: **Minify all JavaScript files asynchronously and wait**
        const jsFiles = glob.sync("**/*.js", { cwd: PROD_DIR, ignore: ["**/*.min.js"], absolute: true });

        await Promise.all(jsFiles.map(async (filePath) => {
            try {
                const code = fs.readFileSync(filePath, "utf-8");
                const minified = await terserMinify(code); // ✅ Using correct Terser import

                if (minified.code) {
                    fs.writeFileSync(filePath, minified.code);
                    console.log(`✅ Minified: ${filePath}`);
                } else {
                    throw new Error(`❌ Minification failed for ${filePath}`);
                }
            } catch (error) {
                throw new Error(`❌ Minification failed for ${filePath}: ${error.message}`);
            }
        }));

        // Step 5: **Minify all CSS files in `prod/styles/` using `csso`**
        const cssFiles = glob.sync("styles/**/*.css", { cwd: PROD_DIR, absolute: true });

        await Promise.all(cssFiles.map(async (filePath) => {
            try {
                const css = fs.readFileSync(filePath, "utf-8");
                const minifiedCss = cssoMinify(css).css; // ✅ Using correct `csso` import

                fs.writeFileSync(filePath, minifiedCss);
                console.log(`✅ Minified CSS: ${filePath}`);
            } catch (error) {
                throw new Error(`❌ CSS Minification failed for ${filePath}: ${error.message}`);
            }
        }));

        console.log("✅ Production build completed!");
        process.exit(0); // Exit successfully
    } catch (error) {
        console.error(`❌ Build failed!`, error);
        process.exit(1); // Exit with an error
    }
})();
