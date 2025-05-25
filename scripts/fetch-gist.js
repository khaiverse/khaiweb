import fetch from 'node-fetch';
import fs from 'fs/promises';

// ID Gist yang berisi file markdown
const GIST_ID = 'cbde8f9b3cfc9aab48b4664fa058e1e9';
const GITHUB_TOKEN = process.env.KHAI_TOKEN; // 🟡 Tambahan untuk akses Gist privatee
const CONTENT_DIR = 'content';

async function fetchGistMarkdown() {
  console.log(`🔄 Fetching Gist ID: ${GIST_ID}...`);

  // 🟡 Tambahan header auth pakai token
  const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      'User-Agent': 'gist-fetch-script',
    },
  });

  if (!res.ok) {
    throw new Error(`GitHub API returned status ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const files = data.files;

  console.log('🧹 Cleaning content/posts folder...');
  await fs.rm(`${CONTENT_DIR}/posts`, { recursive: true, force: true });
  console.log('✅ content/posts cleaned');

  await fs.mkdir(`${CONTENT_DIR}/posts`, { recursive: true });

  for (const file of Object.values(files)) {
    if (!file.filename.endsWith('.md')) continue;

    console.log(`➡️ Processing file: ${file.filename}`);
    const content = file.content;

    const match = content.match(/^---\s*([\s\S]*?)\s*---/);
    let type = 'post';

    if (match) {
      const frontmatter = match[1];
      const typeMatch = frontmatter.match(/type:\s*["']?(page|post)["']?/i);
      if (typeMatch) type = typeMatch[1].toLowerCase();
    }

    const targetPath = type === 'page'
      ? `${CONTENT_DIR}/${file.filename}`
      : `${CONTENT_DIR}/posts/${file.filename}`;

    try {
      await fs.writeFile(targetPath, content);
      console.log(`✅ Saved file: ${targetPath}`);
    } catch (e) {
      console.error(`❌ Failed to write file ${targetPath}:`, e);
    }
  }

  console.log('✅ Fetched and saved all Gist content.');
}

fetchGistMarkdown().catch(err => {
  console.error('❌ Error fetching gist:', err);
  process.exit(1);
});
