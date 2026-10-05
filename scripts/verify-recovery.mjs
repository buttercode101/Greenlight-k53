import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const html=fs.readFileSync('index.html','utf8');
function between(a,b){return html.slice(html.indexOf(a),html.indexOf(b,html.indexOf(a)));}
class Element{
 constructor(){this.children=[];this.listeners={};this.disabled=false;this.classList={add(){},remove(){}};}
 set innerHTML(v){this.html=v;this.nodes={};this.options=[...v.matchAll(/class="opt"[^>]*data-i="(\d+)"/g)].map(m=>{const e=new Element();e.index=m[1];return e;});}
 get innerHTML(){return this.html||'';}
 querySelector(s){return this.nodes[s]??=new Element();}
 querySelectorAll(s){if(s==='.opt')return this.options||[];return [];}
 addEventListener(k,fn){this.listeners[k]=fn;}
 getAttribute(){return this.index;}
 appendChild(e){this.children.push(e);this.card=e;}
 click(){if(!this.disabled)this.listeners.click?.();}
}
function setup(){
 const app=new Element();let time=1000,saved,attempts=0;
 const window={addEventListener(){},confirm:()=>true,scrollTo(){}};
 const ctx=vm.createContext({window,console,Math,Date:class extends Date{static now(){return time;}},localStorage:{getItem:()=>null,setItem(){}},app,ce:()=>new Element(),$:s=>app.querySelector(s),document:{querySelector:s=>app.querySelector(s)},setInterval:()=>1,clearInterval(){},safeHTML:s=>String(s),backbar:()=>'',bookmarkButton:()=>'',evidence:()=>'',bindBookmark(){},bindGo(){},renderAnswerTools(){},recordAttempt(){attempts++;},addReview(){},confetti(){},setVehicleCode(c){ctx.K.state.vehicleCode=c;},renderHome(){},openReview(){}});
 vm.runInContext(html.match(/<script>([\s\S]*?)<\/script>/)[1],ctx);
 ctx.K=window.__K53;ctx.K.save=()=>{saved=JSON.parse(JSON.stringify(ctx.K.state));return true;};
 vm.runInContext("const SECTION_ORDER=['rules','signs','controls'];const SECTION_META={rules:{name:'Rules',n:28,need:22},signs:{name:'Signs',n:28,need:23},controls:{name:'Controls',n:8,need:6}};",ctx);
 vm.runInContext(between('let mockData=[];','function openMock(){'),ctx);
 vm.runInContext(between('function startMock(','/* ---------- SHARE CARD'),ctx);
 vm.runInContext(between('function startSim(','window.__views='),ctx);
 ctx.finishMock=()=>{ctx.clearAssessment();};
 return {ctx,app,setTime:t=>time=t,get saved(){return saved;},get attempts(){return attempts;}};
}
for(const mode of ['sim','mock']){
 const h=setup();vm.runInContext('mockSeconds=60',h.ctx);
 if(mode==='sim')h.ctx.startSim();else h.ctx.startMock('rules');
 assert(h.ctx.validAssessment(h.saved.activeAssessment));
 const original=structuredClone(h.saved.activeAssessment);
 assert.equal(original.deadline,61000);
 const answer=h.app.card.options[0];answer.click();
 const checkpoint=structuredClone(h.saved.activeAssessment);
 assert.equal(checkpoint.answers[0],0);assert.equal(h.attempts,1);
 const reloaded=setup();reloaded.setTime(21000);
 reloaded.ctx.K.state=h.saved;
 // Use the actual resume entry point, with safe local asset rendering.
 reloaded.ctx.reviewArt=()=>'';
 reloaded.ctx.resumeAssessment();
 assert.equal(reloaded.saved.activeAssessment.deadline,61000);
 assert.deepEqual(reloaded.saved.activeAssessment.questions.map(q=>q.q),checkpoint.questions.map(q=>q.q));
 assert(reloaded.app.card.options.every(b=>b.disabled),'Submitted answer must remain locked');
 assert.equal(reloaded.attempts,0,'Resume must not record an attempt twice');
 reloaded.app.card.querySelector('.next').click();
 assert.equal(reloaded.saved.activeAssessment.i,1);
 assert(reloaded.app.card.options.every(b=>!b.disabled),'Next unanswered question remains available');
 reloaded.setTime(62000);reloaded.app.card.options[0].click();
 assert.equal(reloaded.attempts,0,'An answer after the deadline must not count');
 assert.equal(reloaded.saved.activeAssessment,undefined,'Expired attempt clears checkpoint');
 for(const change of [{version:2},{code:'9'},{deadline:-1},{i:100},{answers:[]},{questions:[]},{answers:[99,...checkpoint.answers.slice(1)]}])assert.equal(h.ctx.validAssessment({...checkpoint,...change}),false);
 console.log(`${mode}: exact paper, locked answers, preserved deadline, no duplicate scoring, late-answer rejection and corrupt checkpoint checks passed.`);
}
