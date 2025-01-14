require('dotenv').config();
const FtpDeploy = require("ftp-deploy");
const ftpDeploy = new FtpDeploy();
const path = require("path");
const glob = require("glob"); // For pattern matching

// Get the pattern from the command-line argument, default to "**/*" (all files)
const filePattern = process.argv[2] || "**/*";

// Set the local and remote roots
const localRoot = path.join(__dirname, "app");
const remoteRoot = process.env.SFTP_DIR;

// Utility function to get files matching a pattern
function getFilesMatchingPattern(pattern) {
  return glob.sync(pattern, { cwd: localRoot, nodir: true });
}

// Determine files to include based on the provided pattern
const filesToInclude = getFilesMatchingPattern(filePattern);
console.log("filesToInclude", filesToInclude);

if (filesToInclude.length === 0) {
  console.error(`No files matched the pattern: ${filePattern}`);
  process.exit(1);
}

const config = {
  user: process.env.SFTP_USER,
  password: process.env.SFTP_PASS,
  host: process.env.SFTP_HOST,
  port: 22,
  localRoot: localRoot,
  remoteRoot: remoteRoot,
  include: filesToInclude,
  deleteRemote: false,
  forcePasv: true,
  sftp: true,
  log: true,
};

// Deploy the files
ftpDeploy
  .deploy(config)
  .then((res) => console.log("Deployment finished successfully:", res))
  .catch((err) => console.error("Deployment failed:", err));

// Event listeners for verbose output
ftpDeploy.on("uploading", (data) => {
  console.log(
    `Uploading: ${data.transferredFileCount}/${data.totalFilesCount} files, Current file: ${data.filename}`
  );
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
