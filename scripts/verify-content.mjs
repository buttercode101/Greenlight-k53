import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const html=fs.readFileSync('index.html','utf8');
const js=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
const names=[...html.matchAll(/^const ([A-Z][A-Z0-9_]+)=/gm)].map(m=>m[1]);
assert.equal(new Set(names).size,names.length,'Duplicate top-level constant across inline scripts');
assert(js,'Data script missing');
const window={};const ctx=vm.createContext({window,localStorage:{getItem:()=>null,setItem:()=>{}},console,Date,Math});
vm.runInContext(js,ctx);
const K=window.__K53;
assert.equal(K.SIGNS.length,39);
assert.equal(K.MARKINGS.length,10);
for(const code of ['1','2','3']){
 const rules=K.rulesForCode(code),extras=K.extraForCode(code),controls=K.controlsForCode(code);
 assert(rules.length+extras.length>=28,`Code ${code} rules below 28`);
 assert(controls.length>=8,`Code ${code} controls below 8`);
 for(const [pool,n] of [[rules.concat(extras),28],[K.SIGNS.concat(K.MARKINGS,K.SIGN_VARIANTS),28],[controls.concat(K.CONTROL_VARIANTS),8]]){
  const papers=[1,2,3].map(i=>K.selectPaper(pool,n,i));
  papers.forEach(p=>assert.equal(p.length,n));
  assert.equal(new Set(papers.flat()).size,n*3,`Code ${code} paper rosters overlap within a section`);
 }
 assert.equal(new Set(controls.map(x=>x.q)).size,controls.length);
 for(const q of controls.concat(extras,K.SIGN_VARIANTS,K.CONTROL_VARIANTS)){
  assert(q.q?.trim()&&q.ex?.trim(),`Code ${code} incomplete explanation`);
  assert(Number.isInteger(q.ans)&&q.ans>=0&&q.ans<q.opts.length);
  assert.equal(new Set(q.opts.map(x=>x.trim())).size,q.opts.length,`Duplicate choices: ${q.q}`);
 }
 if(code==='1')assert(!rules.some(x=>/learner drive a car|seatbelt|trailer/i.test(x.q)));
 console.log(`Code ${code}: ${rules.length}+${extras.length} rules, ${K.SIGNS.length}+${K.MARKINGS.length} signs/markings, ${controls.length} controls`);
}
assert(K.SIGN_VARIANTS.length>=35&&K.RULE_VARIANTS.length>=23&&K.CONTROL_VARIANTS.length>=15);
for(const code of ['1','2','3'])assert.equal(K.CONTROL_LESSONS.filter(x=>x.code===code).length,5);
for(const code of ['1','2','3']){
 const rules=K.rulesForCode(code).concat(K.extraForCode(code));
 const sign=K.SIGNS.concat(K.MARKINGS,K.SIGN_VARIANTS);
 const ctrl=K.controlsForCode(code).concat(K.CONTROL_VARIANTS);
 const papers=[1,2,3].map(i=>({rules:K.selectPaper(rules,28,i),sign:K.selectPaper(sign,28,i),ctrl:K.selectPaper(ctrl,8,i)}));
 for(const paper of papers){
  assert(paper.rules.some(x=>K.RULE_VARIANTS.includes(x)),`Code ${code} paper omits new rule scenarios`);
  assert(paper.sign.some(x=>K.SIGN_VARIANTS.includes(x)),`Code ${code} paper omits sign scenarios`);
  assert(paper.ctrl.some(x=>K.CONTROL_VARIANTS.includes(x)),`Code ${code} paper omits shared controls`);
 }
}
assert.equal(new Set([...K.MOCK_EXTRA,...K.RULE_VARIANTS,...K.SIGN_VARIANTS,...K.CONTROL_VARIANTS].map(x=>x.q)).size,K.MOCK_EXTRA.length+K.RULE_VARIANTS.length+K.SIGN_VARIANTS.length+K.CONTROL_VARIANTS.length);
assert(!/Monday|first.time pass|official question bank access/i.test(html));
const registry=JSON.parse(fs.readFileSync('content-register.json','utf8'));
assert.equal(registry.records.length,295);
assert(registry.records.every(x=>/^https:\/\/www\.(natis\.gov\.za|gov\.za)\//.test(x.source)));
assert(registry.records.every(x=>x.reviewStatus==='Independently reviewed' ? x.reviewer&&x.reviewDate&&x.sourceLocator&&x.independentReview : x.reviewer===null&&x.reviewDate===null));
const extract=(name)=>{
 const start=html.indexOf('const '+name+'=[');assert(start>=0);
 const end=/\n\s*\];/.exec(html.slice(start));assert(end);
 return vm.runInNewContext('('+html.slice(start+('const '+name+'=').length,start+end.index+end[0].length).replace(/;$/,'')+')');
};
const situations=extract('SITUATIONS');
assert.equal(situations.length,6);
for(const s of situations){
 assert(K.SIGNS.some(sign=>sign.id===s.sign),`Missing scene sign ${s.sign}`);
 assert.equal(s.opts.length,s.why.length);
 assert.equal(new Set(s.opts).size,s.opts.length);
 assert(Number.isInteger(s.ans)&&s.ans>=0&&s.ans<s.opts.length);
 assert(s.q&&s.ex&&s.note&&s.why.every(x=>x.trim()));
}
assert.equal(registry.records.filter(x=>x.id.startsWith('situations-')).length,situations.length);
assert.equal(registry.records.filter(x=>x.id.startsWith('practical-')).length,12);
assert(html.includes('situations:openSituations')&&html.includes('data-go="situations"'));
assert(html.includes('practical:openPractical')&&html.includes('concepts:openConceptFocus'));
console.log('Control choice invariants and code scope passed.');
