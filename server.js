// server.js
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const ROOT_DIR = __dirname; // directory where .txt files are stored

http.createServer((req, res) => {
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
}).listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});