#!/usr/bin/env node
/**
 * IndexNow ping (Bing, Yandex, Seznam, Naver …) — plain node, no deps.
 *
 *   node scripts/indexnow.mjs                      # submit every <loc> in the live sitemap
 *   node scripts/indexnow.mjs /pricing /free-tools # submit specific paths or URLs
 *
 * The key is public by design: it is served at /<key>.txt from public/, and
 * the engines fetch that file to confirm we own the host. Override the
 * origin with SITE_URL (e.g. to test against a preview host).
 */
const SITE_URL = (process.env.SITE_URL ?? "https://stylemirrorai.com").replace(
  /\/$/,
  "",
);
const KEY = "236c5a7e60c2a74b932f4d045d8c53b3";
const ENDPOINT = "https://api.indexnow.org/indexnow";

const toUrl = (p) => (/^https?:\/\//.test(p) ? p : `${SITE_URL}${p}`);

async function sitemapUrls() {
  const res = await fetch(`${SITE_URL}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap.xml → HTTP ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

async function main() {
  const args = process.argv.slice(2);
  const urlList = args.length ? args.map(toUrl) : await sitemapUrls();
  if (!urlList.length) throw new Error("no URLs to submit");

  // Fail fast if the key file isn't deployed — the engines would reject us.
  const keyLocation = `${SITE_URL}/${KEY}.txt`;
  const keyRes = await fetch(keyLocation);
  if (!keyRes.ok || (await keyRes.text()).trim() !== KEY) {
    throw new Error(`key file not live at ${keyLocation}`);
  }

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: new URL(SITE_URL).host,
      key: KEY,
      keyLocation,
      urlList,
    }),
  });
  // 200 = accepted, 202 = accepted, key validation pending.
  if (res.status !== 200 && res.status !== 202) {
    throw new Error(`IndexNow → HTTP ${res.status}: ${await res.text()}`);
  }
  console.log(`IndexNow ${res.status}: submitted ${urlList.length} URL(s)`);
  for (const u of urlList) console.log(`  ${u}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
