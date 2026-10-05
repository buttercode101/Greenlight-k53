import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const html=fs.readFileSync('index.html','utf8');
const functions=['remainingSeconds','sectionPassed'].map(name=>{
  const match=html.match(new RegExp(`function ${name}\\([^\\n]+`));
  assert(match,`Missing ${name}`);
  return match[0];
});
const ctx=vm.createContext({Math,Date});
vm.runInContext(functions.join('\n'),ctx);
assert.equal(ctx.remainingSeconds(60_000,0),60);
assert.equal(ctx.remainingSeconds(60_000,30_250),30);
assert.equal(ctx.remainingSeconds(60_000,120_000),0,'Background delay must not extend the timer');
assert.equal(ctx.sectionPassed(22,22,28,22),false,'An unfinished rules section cannot pass');
assert.equal(ctx.sectionPassed(22,28,28,22),true);
assert.equal(ctx.sectionPassed(23,28,28,23),true);
assert.equal(ctx.sectionPassed(5,8,8,6),false);
assert(html.includes('answered++')&&html.includes('sectionPassed(correct,answered,total,need)'));
assert(html.includes('assessmentActive && !window.confirm'));
console.log('Assessment deadline, full-section pass gate and exit guard passed.');

let storageBlocked=true,errors=0;
const window={dispatchEvent:()=>errors++};
const data=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const stateContext=vm.createContext({window,console:{warn(){}},Date,Math,Event:class{},localStorage:{getItem(){return null;},setItem(){if(storageBlocked)throw Error('Quota exceeded');}}});
vm.runInContext(data,stateContext);
assert.equal(window.__K53.save(),false);
assert.equal(window.__storageFailed,true);
assert.equal(errors,1);
storageBlocked=false;
assert.equal(window.__K53.save(),true);
assert.equal(window.__storageFailed,false);
console.log('Storage failure and recovery signals passed.');
