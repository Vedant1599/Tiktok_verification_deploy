// server.js
const http = require("http");
const fs = require("fs");
const path = require("path");


const PORT = 3000;
const ROOT_DIR = __dirname; // directory where .txt files are stored
const downloadFile = require('./downloadFile');

http.createServer((req, res) => {
  if (req.url.endsWith(".mp4")) {
    // Download, serve, and schedule deletion of .mp4 file
    const videoPath = req.url.startsWith("/") ? req.url.slice(1) : req.url;
    const remoteUrl = `https://media.begenuin.com/${videoPath}`;
    const localPath = path.join(ROOT_DIR, path.basename(videoPath));
    fs.access(localPath, fs.constants.F_OK, (err) => {
      if (!err) {
        // File already exists, serve it
        serveVideo(localPath, res);
        scheduleDelete(localPath);
      } else {
        // Download and serve
        downloadFile(remoteUrl, localPath, (err) => {
          if (err) {
            res.writeHead(502, { 'Content-Type': 'text/plain' });
            return res.end('Failed to fetch video.');
          }
          serveVideo(localPath, res);
          scheduleDelete(localPath);
        });
      }
    });
    return;
  } else if (req.url === "/" || req.url === "") {
    // Serve any .txt file in the directory (pick the first one found)
    fs.readdir(ROOT_DIR, (err, files) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        return res.end("Server error.");
      }
      const txtFiles = files.filter(f => f.endsWith(".txt"));
      if (txtFiles.length === 0) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        return res.end("No .txt file found.");
      }
      const filePath = path.join(ROOT_DIR, txtFiles[0]);
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          res.writeHead(404, { "Content-Type": "text/plain" });
          return res.end("File not found.");
        }
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end(data);
      });
    });
  } else {
    const fileName = req.url.slice(1); // remove leading "/"
    const filePath = path.join(ROOT_DIR, fileName);
    // Allow only .txt files for safety
    if (!fileName.endsWith(".txt")) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      return res.end("Only .txt files are allowed.");
    }
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        return res.end("File not found.");
      }
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end(data);
    });
  }
// Serve video file helper
function serveVideo(filePath, res) {
  fs.stat(filePath, (err, stats) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('Video not found.');
    }
    res.writeHead(200, {
      'Content-Type': 'video/mp4',
      'Content-Length': stats.size
    });
    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  });
}

// Schedule file deletion after 120 seconds
function scheduleDelete(filePath) {
  setTimeout(() => {
    fs.unlink(filePath, (err) => {
      if (!err) {
        console.log(`Deleted: ${filePath}`);
      }
    });
  }, 120 * 1000);
}

}).listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});