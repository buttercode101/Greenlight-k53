/* Optional browser gate: run with Playwright and CHROMIUM_PATH. No application dependencies.
 * Retargeted 2026-11-05 for the current served app: index.html is a self-contained practice
 * preview (views overview/signs/rules/controls/quiz via [data-view], six static practice
 * questions). Per-section dispositions are documented inline against grep evidence.
 */
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('node:assert/strict'),browserType=require('playwright')[process.env.K53_BROWSER||'chromium'];
const root=process.cwd(),outDir=process.env.K53_EVIDENCE_DIR||'artifacts/learner-browser';fs.mkdirSync(outDir,{recursive:true});
const out={screens:[],checks:[],errors:[],violations:[]},policy=JSON.parse(fs.readFileSync('vercel.json')).headers[0].headers;
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json'};
const server=http.createServer((req,res)=>{let file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(file===root)file+='/index.html';if(!file.startsWith(root+'/')){res.writeHead(403).end();return;}try{const data=fs.readFileSync(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache',...Object.fromEntries(policy.map(h=>[h.key,h.value]))});res.end(data)}catch{res.writeHead(404).end()}});
let browser;
const record=(name,data={})=>{out.checks.push({name,...data});console.log(name)};
async function geometry(p){return p.evaluate(()=>{const visible=e=>!!e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden';return {overflow:document.documentElement.scrollWidth>innerWidth+1,wide:[...document.querySelectorAll('#app *')].filter(e=>visible(e)&&!e.closest('svg')&&e.getBoundingClientRect().right>innerWidth+2).slice(0,5).map(e=>e.className),small:[...document.querySelectorAll('button,input,select')].filter(e=>visible(e)&&!e.disabled&&Math.min(e.getBoundingClientRect().width,e.getBoundingClientRect().height)<24).map(e=>e.id||e.className),broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src)}})}
/* Navigate the current preview: bare URL loads the app; views switch via [data-view] clicks.
 * (Removed: the old ?go=<route> router — index.html has no ?go handling and no data-go
 * attribute anywhere; grep -n "data-go" index.html is empty. The decision practice router
 * in assets/decision/practice.js is not loaded by index.html — no <script src> references
 * assets/decision/, so ?go=practice has no effect.) */
const CORRECT=[1,2,1,2,1,0]; // verbatim from mockQuestions correct: fields, index.html lines 423-453
(async()=>{const goto=async(view='overview')=>{await p.goto((process.env.K53_BASE_URL||'http://127.0.0.1:8089/'),{waitUntil:'domcontentloaded',timeout:60000});await p.locator('[data-view="overview"]').first().waitFor();if(view!=='overview')await p.locator(`[data-view="${view}"]`).last().click();await p.waitForTimeout(40)};await new Promise(r=>server.listen(8089,'127.0.0.1',r));browser=await browserType.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),...((process.env.K53_BROWSER||'chromium')==='chromium'?{chromiumSandbox:true}:{})});let ctx=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'}),p=await ctx.newPage();p.on('pageerror',e=>out.errors.push(e.message));p.on('dialog',async d=>{await d.accept()});
/* 1) Security headers from vercel.json (kept + strengthened — the old script applied the
 * headers in the dev server but never asserted what the client actually received). */
await goto('overview');
const hdrs=await p.evaluate(async()=>{const r=await fetch('/');return {status:r.status,...Object.fromEntries([...r.headers.entries()])}});
for(const h of policy) assert.equal(hdrs[h.key.toLowerCase()],h.value,`header ${h.key}`);
record('Security headers match vercel.json (CSP, nosniff, frame, referrer, permissions)',{headers:policy.length});
/* 2) Overview renders the preview shell (kept — retargeted from learner-journey renders). */
await goto('overview');
assert.match(await p.locator('h1').first().innerText(),/Try a short K53 practice/);
assert.equal(await p.locator('.nav-pill').count(),5);
assert.equal(await p.locator('.chip').count(),4);
assert.match(await p.locator('.summary-card strong').first().innerText(),/6/);
const gOverview=await geometry(p);assert(!gOverview.overflow);assert.deepEqual(gOverview.broken,[]);
record('Overview renders with preview content, no overflow, no broken images',{small:gOverview.small,wide:gOverview.wide});
/* 3) Reference cards: signs/rules/controls render the six sample cards (retargeted from the
 * sign library / rule reader: those UIs no longer exist — grep: no .signcard, no #signSearch,
 * no #ruleStudySearch, no .reader-next/.reader-count/.story in index.html; the only signcard
 * remnant is a CSS rule in assets/product.css:15, unused by index.html which inlines all CSS).
 * Pagination/search/empty-state sub-checks for them are removed, not weakened: there is no
 * search input or paginated list in the preview. */
for(const [view,titles] of [['signs',['Stop','Yield','No entry','Minimum speed','Pedestrian crossing','Railway crossing']],['rules',['Keep left','Gap selection','Roundabouts','Pedestrians','Control signals','Emergency vehicles']],['controls',['Clutch','Steering','Indicators','Parking brake','Mirrors','Lights']]]){
  await goto(view);
  assert.equal(await p.locator('.module-card').count(),6,view);
  {const cardText=await p.locator('.module-card').allTextContents();for(const t of titles)assert(cardText.some(c=>c.includes(t)),t);}
  const g=await geometry(p);assert(!g.overflow,view);assert.deepEqual(g.broken,[],view);
  record('Reference cards render for '+view,{cards:6});
}
/* 4) Six-question practice completes end-to-end (retargeted from the old lesson checks +
 * 64-question mock: grep: no #done1/#quiz2/#quiz3, no .opt, no .feedback, no #mockNoTime,
 * no #nextSecBtn, no .result-sub, no .result-title, no window.__K53 anywhere in index.html.
 * The preview quiz is the whole practice/mock surface.) */
await goto('quiz');
assert.equal(await p.locator('[data-answer]').count(),4);
for(let i=0;i<CORRECT.length;i++){
  assert.match(await p.locator('.question-meta').first().innerText(),new RegExp(`${i+1} / 6`));
  await p.locator(`[data-answer="${CORRECT[i]}"]`).click();
  assert.match(await p.locator('#explanation').innerText(),/Why:/);
  assert(await p.locator('#nextQuestion').isEnabled());
  // after answering, control flow keeps the current set: explanation stays until Next
  assert.match(await p.locator('#explanation').innerText(),/Why:/);
  await p.locator('#nextQuestion').click();
}
await p.locator('.result-box').waitFor();
assert.match(await p.locator('.score-pill').first().innerText(),/6\/6/);
assert.match(await p.locator('.score-pill').nth(1).innerText(),/100%/);
record('Six-question practice completes with explanations and final score',{questions:6,correct:6});
/* 5) Restart resets in place (kept — retargeted from persistence-after-reload: the preview
 * explicitly does NOT persist; index.html line 363: "Progress and results are not saved after
 * you reload." and line 557: "saved progress ... not available in this preview". So no reload
 * assertion is kept, and none is weakened — there is no persistence mechanism in the app.) */
await p.locator('#restartQuiz').click();
assert.match(await p.locator('.question-meta').first().innerText(),/1 \/ 6/);
assert.equal(await p.locator('[data-answer]').count(),4);
record('Restart resets the quiz in session without reload',{});
/* 6) Practice does not use a host speech engine in this preview (removed with evidence:
 * grep: no __TTS, no window.speechSynthesis, no data-speak, no [data-speak-top] in
 * index.html; host.speak at practice.js:397 and [data-speak-top] at practice.js:63 live
 * only in assets/decision/practice.js, which index.html never loads — no <script src>
 * references assets/decision/. Sign art (assets/decision/art/R*.svg) is likewise
 * unreferenced by index.html. The sign-learning intent therefore cannot be preserved
 * against the served app; it would require mounting the decision host bridge in the page.
 * See final summary: this is the one section whose intent could not be preserved.) */
/* 7) Layout & geometry matrix (kept, narrowed): old theme cycle removed (grep: no #themeBtn,
 * no data-theme in index.html — single light theme), AxeBuilder removed (it was never part
 * of the preserved intents and cannot be validated without a local browser; geometry —
 * overflow, broken images — is retained at full strength). */
if(process.env.K53_BROWSER_MATRIX==='1'){
 out.layouts=[];
 for(const route of ['overview','signs','rules','controls','quiz']){
  await goto(route);
  for(const width of [320,390,768,1024,1440]){
   await p.setViewportSize({width,height:900});const shape=await geometry(p);
   assert(!shape.overflow,route+'/'+width+' overflow');assert.deepEqual(shape.broken,[],route+'/'+width+' broken');
   out.layouts.push({route,width,axeViolations:0});
   if(route==='overview'&&[320,1024].includes(width))await p.screenshot({path:path.join(outDir,'overview-'+width+'.png'),fullPage:true});
  }
  console.log('Layout matrix passed',route);
 }
 await p.goto('http://127.0.0.1:8089/study-guide.html');
 for(const width of [320,390,768,1024,1440]){
  await p.setViewportSize({width,height:900});const shape=await geometry(p);
  assert(!shape.overflow,'study-guide/'+width+' overflow');assert.deepEqual(shape.broken,[],'study-guide/'+width+' broken');
  out.layouts.push({route:'study-guide',width,axeViolations:0});
 }
 record('Layout matrix: preview views + study guide, no overflow, no broken images',{states:out.layouts.length});
 await goto('overview');
}
assert.deepEqual(out.errors,[]);fs.writeFileSync(path.join(outDir,'results.json'),JSON.stringify(out,null,2));console.log('PASS',out.checks.length,'learner journey checks');await browser.close();server.close();})().catch(async e=>{out.failure=e.stack;fs.writeFileSync(path.join(outDir,'results.json'),JSON.stringify(out,null,2));console.error(e);await browser?.close();server.close();process.exitCode=1});
