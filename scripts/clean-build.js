const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

for (const dir of ['dist', 'pagefind']) {
    fs.rmSync(path.join(ROOT, dir), { recursive: true, force: true });
}
