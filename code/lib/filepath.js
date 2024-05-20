const fs = require("fs");
const execSync = require('child_process').execSync;

async function fetchContentFilepath(filepath) {
  try {   
    const data = fs.createReadStream(filepath);
    return data;
  } catch (err) {
    throw new Error("Fetch filepath content fail");
  }
}

module.exports = { fetchContentFilepath };
