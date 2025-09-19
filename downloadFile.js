// Utility to download a file from a URL and save to disk
const https = require('https');
const fs = require('fs');

function downloadFile(url, dest, cb) {
  const file = fs.createWriteStream(dest);
  https.get(url, (response) => {
    if (response.statusCode !== 200) {
      fs.unlink(dest, () => {});
      return cb(new Error(`Failed to get '${url}' (${response.statusCode})`));
    }
    response.pipe(file);
    file.on('finish', () => file.close(cb));
  }).on('error', (err) => {
    fs.unlink(dest, () => {});
    cb(err);
  });
}

module.exports = downloadFile;
