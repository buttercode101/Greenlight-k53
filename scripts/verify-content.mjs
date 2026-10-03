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
 assert.equal(new Set(controls.map(x=>x.q)).size,controls.length);
 for(const q of controls.concat(extras)){
  assert(q.q?.trim()&&q.ex?.trim(),`Code ${code} incomplete explanation`);
  assert(Number.isInteger(q.ans)&&q.ans>=0&&q.ans<q.opts.length);
  assert.equal(new Set(q.opts.map(x=>x.trim())).size,q.opts.length,`Duplicate choices: ${q.q}`);
 }
 if(code==='1')assert(!rules.some(x=>/learner drive a car|seatbelt|trailer/i.test(x.q)));
 console.log(`Code ${code}: ${rules.length}+${extras.length} rules, ${K.SIGNS.length}+${K.MARKINGS.length} signs/markings, ${controls.length} controls`);
}
assert(!/Monday|first.time pass|official question bank access/i.test(html));
const registry=JSON.parse(fs.readFileSync('content-register.json','utf8'));
assert.equal(registry.records.length,189);
assert(registry.records.every(x=>/^https:\/\/www\.(natis\.gov\.za|gov\.za)\//.test(x.source) && x.reviewer===null && x.reviewDate===null));
console.log('Control choice invariants and code scope passed.');
