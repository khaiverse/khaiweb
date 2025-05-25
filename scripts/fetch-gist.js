import fetch from 'node-fetch';
import fs from 'fs/promises';

const GIST_ID = 'cbde8f9b3cfc9aab48b4664fa058e1e9';
const TARGET_DIR = 'content/posts';

async function fetchGistMarkdown() {
  const res = await fetch(`https://api.github.com/gists/${GIST_ID}`);
  const data = await res.json();
  const files = data.files;

  await fs.rm(TARGET_DIR, { recursive: true, force: true });
  await fs.mkdir(TARGET_DIR, { recursive: true });

  for (const file of Object.values(files)) {
    if (file.filename.endsWith('.md')) {
      const filePath = `${TARGET_DIR}/${file.filename}`;
      await fs.writeFile(filePath, file.content);
    }
  }

  console.log('Fetched and saved Gist content.');
}

fetchGistMarkdown().catch(err => {
  console.error('Error fetching gist:', err);
  process.exit(1);
});
