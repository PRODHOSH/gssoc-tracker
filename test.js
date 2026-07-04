const r=require('./test.json').items;
const repos=require('fs').readFileSync('src/data/gssoc-repos.ts','utf8');
const regex = /"([^"]+)"/g;
let m;
const repoList = [];
while ((m = regex.exec(repos)) !== null) { repoList.push(m[1].toLowerCase()); }
const db = new Set(repoList);
const valid = r.filter(p=>{
  const pts=p.repository_url.split('/');
  return db.has(pts[pts.length-2].toLowerCase()+'/'+pts[pts.length-1].toLowerCase());
});
console.log(valid.length, 'valid out of', r.length, valid.map(v=>v.repository_url.split('/').slice(-2).join('/')));
