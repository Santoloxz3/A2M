import { readFile, writeFile } from 'node:fs/promises';

const deployedHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
if (deployedHost) {
  const previousOrigin = 'https://a2m-automation.wolfoloxone.chatgpt.site';
  const currentOrigin = new URL(`https://${deployedHost}`).origin;

  for (const page of ['../dist/index.html', '../dist/en/index.html']) {
    const file = new URL(page, import.meta.url);
    const markup = await readFile(file, 'utf8');
    await writeFile(file, markup.replaceAll(previousOrigin, currentOrigin));
  }
}
