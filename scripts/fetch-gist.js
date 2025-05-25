import fetch from 'node-fetch';
import fs from 'fs/promises';

// ID Gist yang berisi file markdown
const GIST_ID = 'cbde8f9b3cfc9aab48b4664fa058e1e9';

// Folder target untuk simpan konten hasil fetch
const CONTENT_DIR = 'content';

async function fetchGistMarkdown() {
  console.log(`🔄 Fetching Gist ID: ${GIST_ID}...`);

  // Ambil data Gist dari GitHub API
  const res = await fetch(`https://api.github.com/gists/${GIST_ID}`);

  // Cek status response, kalau tidak OK langsung error
  if (!res.ok) {
    throw new Error(`GitHub API returned status ${res.status} ${res.statusText}`);
  }

  // Parsing response JSON
  const data = await res.json();
  const files = data.files;

  // Bersihkan folder content/posts sebelum simpan file baru
  console.log('🧹 Cleaning content/posts folder...');
  await fs.rm(`${CONTENT_DIR}/posts`, { recursive: true, force: true });
  console.log('✅ content/posts cleaned');

  // Buat folder content/posts jika belum ada
  await fs.mkdir(`${CONTENT_DIR}/posts`, { recursive: true });

  // Loop tiap file di Gist
  for (const file of Object.values(files)) {
    // Skip kalau bukan file markdown (.md)
    if (!file.filename.endsWith('.md')) continue;

    console.log(`➡️ Processing file: ${file.filename}`);

    const content = file.content;

    // Cari frontmatter di awal file markdown
    const match = content.match(/^---\s*([\s\S]*?)\s*---/);
    let type = 'post'; // default tipe konten post

    if (match) {
      const frontmatter = match[1];
      // Cek apakah ada field 'type' di frontmatter (page atau post)
      const typeMatch = frontmatter.match(/type:\s*["']?(page|post)["']?/i);
      if (typeMatch) type = typeMatch[1].toLowerCase();
    }

    // Tentukan folder tujuan simpan file berdasarkan tipe
    const targetPath = type === 'page'
      ? `${CONTENT_DIR}/${file.filename}`         // misal: content/disclaimer.md
      : `${CONTENT_DIR}/posts/${file.filename}`;  // misal: content/posts/post1.md

    try {
      // Tulis file markdown ke folder target
      await fs.writeFile(targetPath, content);
      console.log(`✅ Saved file: ${targetPath}`);
    } catch (e) {
      // Kalau gagal tulis file, catat error tapi lanjut proses file lain
      console.error(`❌ Failed to write file ${targetPath}:`, e);
    }
  }

  console.log('✅ Fetched and saved all Gist content.');
}

// Jalankan fungsi utama, tangkap error kalau ada
fetchGistMarkdown().catch(err => {
  console.error('❌ Error fetching gist:', err);
  process.exit(1);
});
