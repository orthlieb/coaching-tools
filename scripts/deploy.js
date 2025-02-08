require('dotenv').config();
const FtpDeploy = require("ftp-deploy");
const ftpDeploy = new FtpDeploy();
const path = require("path");
const glob = require("glob");

// Set the local and remote roots
const localRoot = path.join(__dirname, "../app");
const remoteRoot = process.env.SFTP_DIR;

// ✅ Utility function to get all files recursively
function getAllFiles() {
    console.log(`🔍 Searching for all files in "${localRoot}"`);

    const matchedFiles = glob.sync("**/*", { cwd: localRoot, nodir: true });

    if (matchedFiles.length === 0) {
        console.warn("⚠️ No files found to upload.");
    } else {
        console.log(`✅ Files matched:\n`, matchedFiles);
    }

    return matchedFiles.map(file => `./${path.normalize(file)}`); // Ensure correct path format
}

// ✅ Get all files for upload
const filesToInclude = getAllFiles();

if (filesToInclude.length === 0) {
    console.error("❌ No files found in the app directory.");
    process.exit(1);
}

// ✅ FTP Deploy Configuration
const config = {
    user: process.env.SFTP_USER,
    password: process.env.SFTP_PASS,
    host: process.env.SFTP_HOST,
    port: 22,
    localRoot: localRoot,
    remoteRoot: remoteRoot,
    include: ["**/*"], // Upload everything recursively
    deleteRemote: true, // ✅ Delete remote directory before uploading
    forcePasv: true,
    sftp: true,
    log: true,
};

// ✅ Start Deployment
ftpDeploy
    .deploy(config)
    .then(() => console.log("✅ Deployment finished successfully!"))
    .catch(err => console.error("❌ Deployment failed:", err));

// ✅ Event Listeners for Detailed Logging
ftpDeploy.on("uploading", data => {
    console.log(`📦 Uploading: ${data.transferredFileCount}/${data.totalFilesCount} files. Current file: ${data.filename}`);
});

ftpDeploy.on("uploaded", data => {
    console.log(`✅ Uploaded: ${data.filename}`);
});

ftpDeploy.on("log", data => {
    console.log(data);
});

ftpDeploy.on("upload-error", data => {
    console.error(`❌ Upload error: ${data.err}`);
});
