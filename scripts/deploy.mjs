import "dotenv/config";
import FtpDeploy from "ftp-deploy";
import path from "path";
import fs from "fs";

// Setup FTP Deployment
const ftpDeploy = new FtpDeploy();

// ✅ Get the directory argument from the command line
const targetDir = process.argv[2] || "app"; // Default to "app" if no argument is provided
const localRoot = path.join(process.cwd(), targetDir); 
const remoteRoot = process.env.SFTP_DIR; // Ensure this is correctly set in `.env`

// Validate that the directory exists before deploying
if (!fs.existsSync(localRoot)) {
    console.error(`❌ Deployment failed: Directory "${localRoot}" does not exist.`);
    process.exit(1);
}

const config = {
    user: process.env.SFTP_USER,
    password: process.env.SFTP_PASS,
    host: process.env.SFTP_HOST,
    port: 22,
    localRoot: localRoot, // ✅ Deploying from either `app/` or `prod/`
    remoteRoot: remoteRoot,
    include: ["**/*"], // Deploy everything in the specified directory
    deleteRemote: true, // Delete remote files before uploading
    forcePasv: true,
    sftp: true,
};

// Deploy the files
ftpDeploy
    .deploy(config)
    .then(res => console.log(`✅ Deployment finished successfully from ${localRoot}:`, res))
    .catch(err => console.error("❌ Deployment failed:", err));

// Event listeners for verbose output
ftpDeploy.on("uploading", (data) => {
    console.log(`Uploading: ${data.transferredFileCount}/${data.totalFilesCount} files, Current file: ${data.filename}`);
});

ftpDeploy.on("uploaded", (data) => {
    console.log(`✅ Uploaded: ${data.filename}`);
});

ftpDeploy.on("log", (data) => {
    console.log(data);
});

ftpDeploy.on("upload-error", (data) => {
    console.error(`❌ Upload error: ${data.err}`);
});
