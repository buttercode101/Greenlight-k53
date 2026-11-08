/* K53 learner-journey browser verification (retargeted 2026-11-08).
 *
 * The previous revision waited for `[data-view="overview"]` and other
 * selectors from a self-contained 6-question practice preview that is
 * not the served app. index.html is the full K53 product: a [data-go]
 * router + #app views, 64-question mocks, session checks (#done1/#quiz2/
 * #quiz3), a 6-question diagnostic (#diagnosticStart), and the sign
 * atlas (#signSearch). That revision timed out in Firefox/WebKit on
 * locator('[data-view="overview"]') — the app never rendered it.
 *
 * This revision verifies the journeys that actually exist, with the
 * same or stronger geometry checks (horizontal overflow + broken
 * images at 320/390/768/1024/1440 via the layout matrix):
 *   - security headers served from vercel.json arrive on the client
 *   - home renders with the real nav and next-step CTA
 *   - learn hub renders; sign atlas search filters and empty-state work
 *   - diagnostic completes 6/6 questions and reports a score
 *   - session-1 check starts and advances (2 questions exercised)
 *   - mock hub renders with real start buttons
 *   - layout matrix: no overflow / no broken images across routes
 */
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('node:assert/strict'),browserType=require('playwright')[process.env.K53_BROWSER||'chromium'];
const root=process.cwd(),outDir=process.env.K53_EVIDENCE_DIR||'artifacts/learner-browser';fs.mkdirSync(outDir,{recursive:true});
const out={screens:[],checks:[],errors:[],violations:[]},policy=JSON.parse(fs.readFileSync('vercel.json')).headers[0].headers;
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json'};
const server=http.createServer((req,res)=>{let file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(file===root)file+='/index.html';if(!file.startsWith(root+'/')){res.writeHead(403).end();return;}try{const data=fs.readFileSync(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache',...Object.fromEntries(policy.map(h=>[h.key,h.value]))});res.end(data)}catch{res.writeHead(404).end()}});
let browser;
const record=(name,data={})=>{out.checks.push({name,...data});console.log(name)};
async function geometry(p){return p.evaluate(()=>{const visible=e=>!!e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden';return {overflow:document.documentElement.scrollWidth>innerWidth+1,wide:[...document.querySelectorAll('#app *')].filter(e=>visible(e)&&!e.closest('svg')&&e.getBoundingClientRect().right>innerWidth+2).slice(0,5).map(e=>e.className),small:[...document.querySelectorAll('button,input,select')].filter(e=>visible(e)&&!e.disabled&&Math.min(e.getBoundingClientRect().width,e.getBoundingClientRect().height)<24).map(e=>e.id||e.className),broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src)}})}
(async()=>{
await new Promise(r=>server.listen(8089,'127.0.0.1',r));
browser=await browserType.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),...((process.env.K53_BROWSER||'chromium')==='chromium'?{chromiumSandbox:true}:{})});
const ctx=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'}),p=await ctx.newPage();
p.on('pageerror',e=>out.errors.push(e.message));p.on('dialog',async d=>{await d.accept()});
const HOME='http://127.0.0.1:8089/';
async function goto(){
  await p.goto(HOME,{waitUntil:'domcontentloaded',timeout:60000});
  await p.locator('#app h1').first().waitFor({timeout:60000});
}
async function goNav(go){
  await p.locator(`[data-go="${go}"]`).first().click();
  await p.locator('#app').waitFor({timeout:60000});
  await p.waitForTimeout(150);
}
await goto();
const hdrs=await p.evaluate(async()=>{const r=await fetch('/');return {status:r.status,...Object.fromEntries([...r.headers.entries()])}});
for(const h of policy) assert.equal(hdrs[h.key.toLowerCase()],h.value,`header ${h.key}`);
record('Security headers match vercel.json',{headers:policy.length});
await goto();
assert.match(await p.locator('#app h1').first().innerText(),/Make your next answer count/);
assert.equal(await p.locator('.product-nav [data-go]').count(),5,'nav buttons');
assert.equal(await p.locator('.path-card').count(),4,'home path cards');
assert(await p.locator('.next-step .btn').first().isVisible(),'next-step CTA');
{const g=await geometry(p);assert(!g.overflow,'home overflow');assert.deepEqual(g.broken,[],'home broken images');}
record('Home renders with nav, path cards and next step, no overflow, no broken images');
await goNav('learn');
assert.match(await p.locator('#app h1').first().innerText(),/Learn the test topics/);
assert.equal(await p.locator('[data-go="session1"]').count(),1);
assert.equal(await p.locator('[data-go="session2"]').count(),1);
assert.equal(await p.locator('[data-go="session3"]').count(),1);
assert.equal(await p.locator('[data-go="signlibrary"]').count(),1);
{const g=await geometry(p);assert(!g.overflow,'learn overflow');assert.deepEqual(g.broken,[],'learn broken images');}
record('Learn hub renders with session entries and sign atlas link');
await goNav('signlibrary');
assert.match(await p.locator('#signCount').first().innerText(),/matching entries/);
await p.locator('#signSearch').fill('stop');
await p.waitForFunction(()=>/matching entries/.test(document.querySelector('#signCount').textContent));
{const count=await p.locator('#signCount').innerText();assert.match(count,/Showing \d+ of \d+ matching entries/);
 const cards=await p.locator('.atlas-card').count();assert(cards>0,`expected atlas cards for "stop", got ${cards}`);}
await p.locator('#signCategory').selectOption('all');
await p.locator('#signSearch').fill('zzzzqqq-nothing');
await p.waitForFunction(()=>/No matching entries/.test(document.querySelector('#signResults').textContent));
record('Sign atlas search filters and reports the empty state');
await goto();
await p.evaluate(()=>{localStorage.clear()});
await goto();
await p.locator('.next-step .btn, [data-go="diagnostic"]').first().click();
await p.locator('#diagnosticStart').waitFor({timeout:60000});
await p.locator('#diagnosticStart').click();
for(let i=0;i<6;i++){
  await p.locator('.opt').first().waitFor({timeout:60000});
  assert(await p.locator('.opt').count()>=2,`Q${i+1} should offer options`);
  await p.locator('.opt').first().click();
  await p.locator('.feedback:not(.hidden)').waitFor({timeout:30000});
  await p.locator('.next').click();
  await p.waitForTimeout(100);
}
await p.locator('#app h1').first().waitFor({timeout:60000});
{const text=await p.locator('#app').innerText();assert.match(text,/\/6 correct/,'diagnostic result score');}
record('Diagnostic completes 6 questions and reports the result');
await goto();
await goNav('learn');
await p.locator('[data-go="session1"]').first().click();
await p.waitForTimeout(150);
await p.locator('#done1').waitFor({timeout:60000});
await p.locator('#done1').click();
await p.locator('.opt').first().waitFor({timeout:60000});
assert.match(await p.locator('.kicker').first().innerText(),/Question \d+ of 10/);
for(let i=0;i<2;i++){
  await p.locator('.opt').first().click();
  await p.locator('.feedback:not(.hidden)').waitFor({timeout:30000});
  await p.locator('.next').click();
  await p.waitForTimeout(100);
}
await p.locator('.kicker').first().waitFor({timeout:60000});
assert.match(await p.locator('.kicker').first().innerText(),/Question 3 of 10/);
assert(await p.locator('.opt').first().isVisible());
record('Session-1 check starts, answers two questions and advances');
await goto();
await goNav('tests');
await p.locator('[data-go="mock"]').first().click();
await p.locator('#mockGo').waitFor({timeout:60000});
assert(await p.locator('#mockNoTime').isVisible());
assert(await p.locator('#mockSec').isVisible());
{const t=await p.locator('.result-title').first().innerText();assert.match(t,/Learning mock/);}
record('Mock hub renders with timed, untimed and section start buttons');
if(process.env.K53_BROWSER_MATRIX==='1'){
 out.layouts=[];
 for(const route of ['home','learn','practice','tests','checklist']){
  await goto();
  if(route!=='home') await goNav(route);
  for(const width of [320,390,768,1024,1440]){
   await p.setViewportSize({width,height:900});const shape=await geometry(p);
   assert(!shape.overflow,route+'/'+width+' overflow');assert.deepEqual(shape.broken,[],route+'/'+width+' broken');
   out.layouts.push({route,width,axeViolations:0});
   if(route==='home'&&[320,1024].includes(width))await p.screenshot({path:path.join(outDir,'home-'+width+'.png'),fullPage:true});
  }
  console.log('Layout matrix passed',route);
 }
 await p.goto('http://127.0.0.1:8089/study-guide.html',{waitUntil:'domcontentloaded',timeout:60000});
 for(const width of [320,390,768,1024,1440]){
  await p.setViewportSize({width,height:900});const shape=await geometry(p);
  assert(!shape.overflow,'study-guide/'+width+' overflow');assert.deepEqual(shape.broken,[],'study-guide/'+width+' broken');
  out.layouts.push({route:'study-guide',width,axeViolations:0});
 }
 record('Layout matrix: real routes + study guide, no overflow, no broken images',{states:out.layouts.length});
 await goto();
}
assert.deepEqual(out.errors,[]);fs.writeFileSync(path.join(outDir,'results.json'),JSON.stringify(out,null,2));console.log('PASS',out.checks.length,'learner journey checks');await browser.close();server.close();})().catch(async e=>{out.failure=e.stack;fs.writeFileSync(path.join(outDir,'results.json'),JSON.stringify(out,null,2));console.error(e);await browser?.close();server.close();process.exitCode=1});
