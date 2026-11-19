// Leonida Trophy Guide — the entry program (Node 22, standard library
// only). The guide is this directory's app/ folder: plain static files a
// browser opens at app/index.html (ES modules, CSS, no build step), offline:
// it loads nothing over the network, and its trophy list and guides live in
// app/data/trophies.json. The program hands the entry in: it copies app/ and
// screenshots/ from beside this file to /output and writes
// /output/dossier.json — the summary the judge reads (the screenshots, the
// first load's files and bytes, and the source) — with the vendored make.fun
// library. Leave vendor/makefun-frontend.ts as it is: the scorer requires
// dossier.json to be byte for byte what its own copy writes.
//
// Before copying, the program checks the guide's own promise: the trophy
// file must name all 55 official trophies, each with a guide that is not
// blank. A build that fails that check stops here instead of handing in an
// entry the gate would refuse.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const EXPECTED_TROPHIES = 55;

// Check the guide's data first: 55 trophies, every one with a guide.
const trophyFile = readFileSync(join(here, 'app', 'data', 'trophies.json'), 'utf8');
const trophyData = JSON.parse(trophyFile);
const trophyList = Array.isArray(trophyData) ? trophyData : trophyData.trophies;
if (!Array.isArray(trophyList) || trophyList.length !== EXPECTED_TROPHIES) {
  throw new Error(`trophies.json holds ${Array.isArray(trophyList) ? trophyList.length : 'no'} trophies, expected ${EXPECTED_TROPHIES}`);
}
const unguided = trophyList.filter((trophy) => typeof trophy.guide !== 'string' || trophy.guide.trim() === '');
if (unguided.length > 0) {
  throw new Error(`trophies without a guide: ${unguided.map((trophy) => trophy.name ?? trophy.id).join(', ')}`);
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files and directories in app/ or
// 48 MiB of app files: app/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
