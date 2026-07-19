const fs = require('fs');
const content = fs.readFileSync('src/data/gssoc-repos.ts', 'utf-8');
const reposMatch = content.match(/const REPOS = \[\s*([\s\S]*?)\s*\];/);
const repoStrings = reposMatch ? reposMatch[1].split(',').map(s=>s.trim().replace(/[\"']/g, '')).filter(Boolean) : [];
const repoSet = new Set(repoStrings.map(r=>r.toLowerCase()));

fetch('https://api.github.com/search/issues?q=type%3Apr+author%3Aeranmol2007-coder+label%3A%22gssoc%3Aapproved%22&per_page=100').then(r=>r.json()).then(d=> { 
  const validPRs = d.items.filter(pr => {
    const parts = pr.repository_url.split('/');
    const repoKey = parts[parts.length-2] + '/' + parts[parts.length-1];
    return repoSet.has(repoKey.toLowerCase());
  });
  const merged = validPRs.filter(i=>i.pull_request && i.pull_request.merged_at);
  console.log('Total valid:', validPRs.length, 'Merged valid:', merged.length);
});
