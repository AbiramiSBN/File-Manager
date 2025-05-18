let historyStack = [];
let currentDir = null;

// Map extensions to SVG icons
const fileIcons = {
  '.txt': '<path d="M6 2h12v20H6z"/>',
  '.js': '<path d="M2 2h20v20H2z"/><text x="6" y="18" font-size="12">JS</text>',
  '.html': '<path d="M2 2h20v20H2z"/><text x="4" y="18" font-size="12">HTML</text>',
  '.jpg': '<circle cx="12" cy="12" r="10"/>',
  '.png': '<circle cx="12" cy="12" r="10"/>',
  'default': '<path d="M6 2h12v20H6z"/>'
};

function getFileIcon(name) {
  const ext = name.slice(name.lastIndexOf('.'));
  return fileIcons[ext] || fileIcons['default'];
}

async function listDir(dir) {
  const url = dir ? `/api/list?dir=${encodeURIComponent(dir)}` : '/api/list';
  const res = await fetch(url);
  const { currentDir: newDir, entries } = await res.json();

  if (currentDir) historyStack.push(currentDir);
  currentDir = newDir;

  document.querySelector('.path').textContent = currentDir;
  document.getElementById('backBtn').disabled = historyStack.length === 0;

  const container = document.getElementById('content');
  container.innerHTML = '';

  entries.forEach(e => {
    const el = document.createElement('div');
    el.className = e.isDirectory ? 'folder' : 'file';
    const svgIcon = e.isDirectory
      ? '<path d="M10 4H2v16h20V6H12l-2-2z"/>'
      : getFileIcon(e.name);
    el.innerHTML = `<svg viewBox="0 0 24 24">${svgIcon}</svg><span>${e.name}</span>`;
    el.onclick = () => {
      if (e.isDirectory) {
        listDir(e.path);
      } else {
        fetch(`/api/open?path=${encodeURIComponent(e.path)}`);
      }
    };
    container.appendChild(el);
  });
}

// Back button handler
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('backBtn').onclick = () => {
    if (historyStack.length) {
      const prev = historyStack.pop();
      currentDir = null; // prevent pushing current again
      listDir(prev);
    }
  };
  listDir();
});