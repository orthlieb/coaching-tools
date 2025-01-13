require("dotenv").config();
const FtpDeploy = require("ftp-deploy");
const ftpDeploy = new FtpDeploy();
const path = require("path");
const fs = require("fs");

// Get the pattern from the command-line argument, default to "*"
const filePattern = process.argv[2] || "*";

// Utility function to filter files based on pattern
function getFilesMatchingPattern(dir, pattern) {
  const regex = new RegExp(pattern.replace("*", ".*"));
  return fs.readdirSync(dir).filter(file => regex.test(file));
}

const localRoot = path.join(__dirname, "app");

// Filter files to include only those matching the pattern, or all files if no pattern is specified
const filesToInclude = filePattern === "*" ? ["**/*"] : getFilesMatchingPattern(localRoot, filePattern).map(file => path.join("**", file));

const config = {
    user: process.env.SFTP_USER, // Use environment variables for credentials
    password: process.env.SFTP_PASS,
    host: process.env.SFTP_HOST,
    port: 22,
    localRoot: __dirname + "/app", // Adjust this to your local build folder
    remoteRoot: process.env.SFTP_DIR, 
    include: filesToInclude,
    deleteRemote: filePattern === "*", // When full deploy delete the directory contents first.
    forcePasv: true, // Use passive mode for FTP
    sftp: true, // Use SFTP instead of FTP
    log: true
};

// Deploy the files
ftpDeploy
  .deploy(config)
  .then(res => console.log("Deployment finished successfully:", res))
  .catch(err => console.error("Deployment failed:", err));

// Event listeners for verbose output
ftpDeploy.on("uploading", (data) => {
  console.log(`Uploading: ${data.transferredFileCount}/${data.totalFilesCount} files, Current file: ${data.filename}`);
});

ftpDeploy.on("uploaded", (data) => {
  console.log(`Uploaded: ${data.filename}`);
});

ftpDeploy.on("log", (data) => {
  console.log(data);
});

ftpDeploy.on("upload-error", (data) => {
  console.error(`Upload error: ${data.err}`);
});