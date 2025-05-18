const express = require('express');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
// Cross-platform home directory
const homeDir = process.env.HOME || process.env.USERPROFILE;

// Serve static front-end
app.use(express.static(path.join(__dirname, 'public')));

// API: list folders/files
app.get('/api/list', (req, res) => {
  const requestedDir = req.query.dir ? path.resolve(req.query.dir) : homeDir;
  if (!requestedDir.startsWith(homeDir)) {
    return res.status(400).json({ error: 'Access denied' });
  }
  fs.readdir(requestedDir, { withFileTypes: true }, (err, items) => {
    if (err) return res.status(500).json({ error: err.message });
    let entries = items.map(item => ({
      name: item.name,
      path: path.join(requestedDir, item.name),
      isDirectory: item.isDirectory()
    }));
    if (requestedDir !== homeDir) {
      entries.unshift({ name: '..', path: path.dirname(requestedDir), isDirectory: true });
    }
    res.json({ currentDir: requestedDir, entries });
  });
});

// API: open file with xdg-open
app.get('/api/open', (req, res) => {
  const filePath = req.query.path;
  if (!filePath || !filePath.startsWith(homeDir)) {
    return res.status(400).json({ error: 'Invalid path' });
  }
  exec(`xdg-open '${filePath.replace(/'/g, "'\\''")}'`, err => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));