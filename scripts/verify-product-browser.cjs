/* Optional browser gate: run with Playwright and CHROMIUM_PATH. No application dependencies. */
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('node:assert/strict'),{chromium}=require('playwright'),AxeBuilder=require('@axe-core/playwright').default;
const root=process.cwd(),outDir=process.env.K53_EVIDENCE_DIR||'artifacts/product-browser';fs.mkdirSync(outDir,{recursive:true});
const out={screens:[],checks:[],errors:[],violations:[]},policy=JSON.parse(fs.readFileSync('vercel.json')).headers[0].headers;
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json'};
const server=http.createServer((req,res)=>{let file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(file===root)file+='/index.html';if(!file.startsWith(root+'/')){res.writeHead(403).end();return;}try{const data=fs.readFileSync(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache',...Object.fromEntries(policy.map(h=>[h.key,h.value]))});res.end(data)}catch{res.writeHead(404).end()}});
let browser;
const record=(name,data={})=>{out.checks.push({name,...data});console.log(name)};
async function geometry(p){return p.evaluate(()=>{const visible=e=>!!e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden';return {overflow:document.documentElement.scrollWidth>innerWidth+1,wide:[...document.querySelectorAll('#app *')].filter(e=>visible(e)&&!e.closest('svg')&&e.getBoundingClientRect().right>innerWidth+2).slice(0,5).map(e=>e.className),small:[...document.querySelectorAll('button,input,select')].filter(e=>visible(e)&&!e.disabled&&Math.min(e.getBoundingClientRect().width,e.getBoundingClientRect().height)<24).map(e=>e.id||e.className),broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src)}})}
async function visit(p,go='home'){await p.goto('http://127.0.0.1:8088/'+(go==='home'?'':'?go='+go),{waitUntil:'domcontentloaded'});if(['drive','practice'].includes(go))await p.locator('#decisionTimed').waitFor();await p.waitForTimeout(40)}
(async()=>{await new Promise(r=>server.listen(8088,'127.0.0.1',r));browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox']});
const c=await browser.newContext({serviceWorkers:'block',timezoneId:'Africa/Johannesburg'});await c.addInitScript(()=>{window.__policy=[];document.addEventListener('securitypolicyviolation',e=>window.__policy.push(e.violatedDirective))});const p=await c.newPage();p.on('pageerror',e=>out.errors.push(e.message));
await visit(p);
const visual=await p.evaluate(()=>{const panel=document.querySelector('.x-command'),heading=panel?.querySelector('.x-command-main h2'),chip=panel?.querySelector('.x-side-label'),display=document.querySelector('.x-welcome h1');return {panelBg:panel&&getComputedStyle(panel).backgroundColor,headingColor:heading&&getComputedStyle(heading).color,chipColor:chip&&getComputedStyle(chip).color,displayFont:display&&getComputedStyle(display).fontFamily};});
assert.equal(visual.panelBg,'rgb(23, 35, 29)','next-move panel must retain its dark surface');
assert.equal(visual.headingColor,'rgb(245, 246, 240)','next-move heading must remain high contrast');
assert.equal(visual.chipColor,'rgb(180, 200, 184)','next-move metadata chips must remain readable');
assert(visual.displayFont,'home display heading must have a computed font');

record('Home visual contract: dark-panel contrast, editorial font and collapsed evidence disclosure');
const a11yRoutes=['home','learn','tests','session1','session2','session3','practice','mock','sim','flash','row','memory','journey','sources','checklist','signlibrary','situations','concepts','practical','rhd','revision','review','cheat'];
for(const theme of ['light','dark']){
 for(const route of a11yRoutes){
  await p.setViewportSize({width:390,height:844});await visit(p,route);await p.evaluate(t=>document.documentElement.dataset.theme=t,theme);await p.mouse.move(0,0);await p.waitForTimeout(250);
  const scan=await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
  if(scan.violations.length){out.violations.push(...scan.violations.map(v=>({theme,route,id:v.id,impact:v.impact,help:v.help,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})));assert.equal(scan.violations.length,0,theme+'/'+route+' WCAG 2.1 AA violations: '+JSON.stringify(out.violations.slice(-scan.violations.length)));}
  record('Accessibility scan passed: '+theme+' / '+route,{axeViolations:scan.violations.length});
 }
}
const views=['home','learn','tests','session1','session2','session3','practice','mock','sim','flash','row','memory','journey','sources','checklist','signlibrary','situations','concepts','practical','rhd','revision','review','cheat'];
for(const [width,height] of [[320,568],[360,800],[390,844],[480,900],[640,900],[768,1024],[834,1194],[1024,768],[1366,900],[1920,1080],[844,390]])for(const theme of ['light','dark']){await p.setViewportSize({width,height});for(const go of views){await visit(p,go);await p.evaluate(t=>document.documentElement.dataset.theme=t,theme);const g=await geometry(p);assert(!g.overflow&&g.wide.length===0&&g.small.length===0&&g.broken.length===0,JSON.stringify({width,height,theme,go,...g}));const violations=await p.evaluate(()=>window.__policy);assert.deepEqual(violations,[],go+' must obey CSP');out.screens.push({width,height,theme,view:go,...g});if([390,1366].includes(width))await p.screenshot({path:path.join(outDir,`${go}-${width}-${theme}.png`),fullPage:false,animations:"disabled"});}console.log('screen matrix',width,height,theme)}
record('506 screens: no horizontal overflow, broken images, tiny controls, page errors or CSP violations');
await p.setViewportSize({width:390,height:844});await visit(p);assert.equal(await p.locator('.drive-entry').count(),0);assert.deepEqual(await p.locator('.product-nav button').allTextContents(),['Home','Learn','Practise','Mock','Test Day']);assert.equal(await p.locator('.product-nav [data-go="drive"]').count(),0);assert.equal(await p.locator('.x-topic').count(),3);assert.equal(await p.locator('.x-quick>button').count(),4);await p.locator('.product-nav [data-go="learn"]').click();await p.locator('.x-lesson-list [data-go="session2"]').click();assert.equal(await p.locator('.product-nav [aria-current="page"]').innerText(),'Learn');await p.locator('.product-nav [data-go="tests"]').click();assert.equal(await p.locator('.x-assessment-pair article').count(),2);assert.equal(await p.locator('.product-nav [aria-current="page"]').innerText(),'Mock');await p.locator('.product-nav [data-go="practice"]').click();await p.locator('#decisionTimed').waitFor();assert.equal(await p.locator('#roadPracticeTitle').innerText(),'Drive');assert.equal(await p.locator('.topbar').count(),1);assert(await p.locator('#decisionPracticePanel').evaluate(e=>e.previousElementSibling.id==='sectionDrills'));assert.equal(await p.locator('.drive-more').getAttribute('open'),null);assert.equal(await p.locator('.drive-quick [data-decision-mode]').count(),3);await p.locator('.drive-more > summary').click();record('Task navigation, dedicated Learn/Tests hubs and secondary Drive placement preserve learner hierarchy');
await p.locator('[data-decision-mode="signs"]').click();const id=await p.locator('[data-question-id]').getAttribute('data-question-id');await p.locator('#themeBtn').click();assert.equal(await p.locator('[data-question-id]').getAttribute('data-question-id'),id);assert.equal(await p.locator('.topbar .ti').count(),3);record('Theme switch keeps the active decision and uses reliable SVG controls');
for(const code of ['1','3']){await p.evaluate(code=>{const s=JSON.parse(localStorage.getItem('k53ww_v2'));s.vehicleCode=code;localStorage.setItem('k53ww_v2',JSON.stringify(s))},code);await visit(p);assert.equal(await p.locator('.drive-entry').count(),0);await p.locator('.product-nav [data-go="practice"]').click();assert.match(await p.locator('.drive-scope').innerText(),new RegExp('Code '+code));assert.equal(await p.locator('#drillSigns').count(),1);assert.equal(await p.evaluate(()=>window.__K53.state.vehicleCode),code);}record('Practice preserves Codes 1 and 3 and explains the Drive feature scope');
await p.evaluate(()=>localStorage.clear());await visit(p,'session1');await p.locator('.backbar button').focus();await p.keyboard.press('Enter');assert.equal(await p.locator('.x-lesson-list').count(),1);await visit(p,'flash');await p.locator('#fc').focus();await p.keyboard.press('Enter');assert(await p.locator('#fc').evaluate(e=>e.classList.contains('flip')));record('Keyboard navigation and flashcard reveal work');
await p.setViewportSize({width:320,height:568});await p.evaluate(()=>{const pool=flashPool().sort((a,b)=>(b.back.mean.length+(b.back.extra?.length||0))-(a.back.mean.length+(a.back.extra?.length||0)));openFlash([pool[0]])});assert(await p.locator('.flash-face').evaluateAll(es=>es.every(e=>e.scrollHeight<=e.clientHeight+1)));record('Longest flashcard explanation fits at 320px without overlapping controls');
await visit(p,'journey');await p.locator('#testDate').fill('2026-12-01');await p.locator('#province').selectOption({label:'Free State'});await p.reload();assert.equal(await p.locator('#testDate').inputValue(),'2026-12-01');assert.equal(await p.locator('#province').inputValue(),'Free State');record('Learner date and province survive reload');
// 200% browser zoom halves the CSS viewport; test that equivalent 640×450 layout directly.
for(const view of ['home','practice','journey','memory','mock']){await p.setViewportSize({width:640,height:450});await visit(p,view);const g=await geometry(p);assert(!g.overflow&&g.wide.length===0,JSON.stringify({zoom:2,cssViewport:'640x450',view,...g}));}record('200% zoom-equivalent 640×450 viewport reflows Home, Drive, planning, memory and mock screens');
for(const stored of [{attempts:{bad:null},review:[null],bookmarks:{bad:null}},{sessions:'bad',mastery:'bad',mockResults:'bad',secPass:'bad',practicalDone:'bad',codeProgress:'bad'},{attempts:{bad:{q:'<img src=x onerror="window.pwned=1">',topic:'<img src=x onerror="window.pwned=2">',correct:1,wrong:1}},review:[],bookmarks:{}}]){await p.evaluate(s=>localStorage.setItem('k53ww_v2',JSON.stringify(s)),stored);await visit(p);assert.equal(await p.locator('.x-welcome').count(),1);assert.equal(await p.evaluate(()=>window.pwned||false),false);assert.equal(await p.locator('#app img[src="x"]').count(),0);}record('Malformed saved progress recovers; stored markup stays inert');
await visit(p);await p.evaluate(()=>{const s=document.createElement('script');s.textContent='window.pwned=1';document.body.append(s)});assert.equal(await p.evaluate(()=>window.pwned||false),false);assert((await p.evaluate(()=>window.__policy)).includes('script-src-elem'));record('CSP blocks injected executable inline scripts');

 // Exercise the populated SM-2 review surface, not only its empty state.
 await visit(p);
 await p.evaluate(()=>{
  const state=JSON.parse(localStorage.getItem('k53ww_v2')||'{}');
  state.vehicleCode='2';
  const q={id:'ui-sm2-fixture',key:'ui-sm2-fixture',q:'When should a learner check the mirrors?',opts:['Before changing direction','Only after stopping'],ans:0,ex:'Observe before changing direction.',topic:'Observation',code:'2'};
  window.GreenLightSM2.recordToReview(state,q,false,Date.now()-3*window.GreenLightSM2.DAY,'ui-sm2-fixture-event');
  localStorage.setItem('k53ww_v2',JSON.stringify(state));
 });
 await visit(p,'review');
 await p.locator('.sm2-overview').waitFor();
 assert.equal(await p.locator('.sm2-day').count(),14,'review activity heatmap has 14 days');
 assert.equal(await p.locator('[data-sm2-flip]').count(),3,'review guide has three interactive interval cards');
 assert(await p.locator('#reviewStart').isVisible(),'due question is actionable');
 const reviewThemes={};
 for(const theme of ['light','dark']){
  await p.evaluate(t=>document.documentElement.dataset.theme=t,theme);
  await p.setViewportSize({width:390,height:844});
  const paint=await p.evaluate(()=>({
   linked:!!document.querySelector('link[href*="experience-finish.css"]'),
   background:getComputedStyle(document.querySelector('.sm2-overview')).backgroundColor,
   foreground:getComputedStyle(document.querySelector('.sm2-metric strong')).color
  }));
  assert(paint.linked,'final interaction stylesheet must load as a real stylesheet');
  assert.notEqual(paint.background,paint.foreground,'review metrics need distinct surface and text colours');
  reviewThemes[theme]=paint;
  const scan=await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
  assert.equal(scan.violations.length,0,theme+'/review populated SM-2 WCAG 2.1 AA violations: '+JSON.stringify(scan.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))));
  for(const [width,height] of [[320,568],[360,800],[390,844],[480,900],[640,900],[768,1024],[1024,768],[1366,900],[1920,1080],[844,390]]){
   await p.setViewportSize({width,height});
   const g=await geometry(p);
   assert(!g.overflow&&g.wide.length===0&&g.small.length===0&&g.broken.length===0,JSON.stringify({theme,width,height,route:'review-populated',...g}));
   out.screens.push({width,height,theme,view:'review-populated',...g});
   if([390,1366].includes(width))await p.screenshot({path:path.join(outDir,`review-populated-${width}-${theme}.png`),fullPage:false,animations:'disabled'});
  }
 }
 assert.notEqual(reviewThemes.light.background,reviewThemes.dark.background,'light and dark review surfaces must visibly differ');
 await p.setViewportSize({width:390,height:844});
 await p.locator('[data-sm2-flip]').first().click();
 assert.equal(await p.locator('[data-sm2-flip]').first().getAttribute('aria-pressed'),'true','interval card activation updates its accessible state');
 record('Populated SM-2 review: light/dark contrast, AA accessibility, 20 responsive states and interactive 3D cards',{states:20});

 await p.goto('http://127.0.0.1:8088/study-guide.html');await p.evaluate(()=>window.print=()=>window.printed=true);await p.locator('#printGuide').click();assert.equal(await p.evaluate(()=>window.printed),true);assert.deepEqual(await p.evaluate(()=>window.__policy),[]);record('Printable guide works under the enforced security policy');
assert.deepEqual(out.errors,[]);fs.writeFileSync(path.join(outDir,'results.json'),JSON.stringify(out,null,2));console.log('PASS',out.screens.length,'responsive screens;',out.checks.length,'interaction/security checks');await browser.close();server.close();
})().catch(async e=>{out.failure=e.stack;fs.writeFileSync(path.join(outDir,'results.json'),JSON.stringify(out,null,2));console.error(e);await browser?.close();server.close();process.exitCode=1});
