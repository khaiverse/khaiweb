const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const GIST_ID = 'cbde8f9b3cfc9aab48b4664fa058e1e9'; // ganti dengan Gist ID kamu

async function fetchGistFiles() {
  const res = await fetch(`https://api.github.com/gists/${GIST_ID}`);
  if (!res.ok) throw new Error(`Failed to fetch Gist: ${res.statusText}`);

  const gist = await res.json();
  const postsDir = path.join(__dirname, '..', 'content', 'posts');

  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true });
  }

  for (const [filename, file] of Object.entries(gist.files)) {
    if (filename.endsWith('.md')) {
      const filepath = path.join(postsDir, filename);
      fs.writeFileSync(filepath, file.content, 'utf8');
      console.log(`Saved ${filename}`);
    }
  }
}

fetchGistFiles().catch(err => {
  console.error(err);
  process.exit(1);
});
