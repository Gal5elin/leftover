import { setTimeout } from 'node:timers/promises';

const revision = process.env.GITHUB_SHA;
const endpoints = [`${process.env.BACKEND_URL}/health`, `${process.env.FRONTEND_URL}/version.json`];
if (!revision || endpoints.some((url) => !url.startsWith('https://'))) {
  throw new Error('GITHUB_SHA, BACKEND_URL and FRONTEND_URL are required');
}

// Wait for this exact release; a responding previous version is not enough.
for (const endpoint of endpoints) {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      const response = await fetch(`${endpoint}?revision=${revision}`, {
        signal: AbortSignal.timeout(10_000),
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (response.ok && (await response.json()).revision === revision) {
        ready = true;
        break;
      }
    } catch {
      // The service may still be starting or applying migrations.
    }
    await setTimeout(5000);
  }
  if (!ready) throw new Error(`Deployment did not become ready: ${endpoint}`);
  console.log(`Verified ${endpoint} at ${revision}`);
}

const homepage = await fetch(process.env.FRONTEND_URL, { signal: AbortSignal.timeout(10_000) });
if (!homepage.ok) throw new Error(`Frontend homepage returned ${homepage.status}`);
console.log('Public frontend homepage is accessible');
