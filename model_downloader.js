const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const lib = url.startsWith('https') ? https : http;
    const request = lib.get(url, response => {
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        // Follow redirects
        return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        reject(new Error(`Request Failed: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => file.close(resolve));
    });
    request.on('error', err => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

async function main() {
  const config = JSON.parse(fs.readFileSync('extra-assets.json', 'utf8'));
  for (const asset of config) {
    const dest = path.resolve(asset.path);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    console.log(`Downloading ${asset.url} -> ${dest}`);
    await downloadFile(asset.url, dest);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
