import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {applyReviews,requireReviewedRelease} from './review-records.mjs';
const html=fs.readFileSync('index.html','utf8');
const sources={SIGNS:'signs',MARKINGS:'signs',SIGN_VARIANTS:'signs',SITUATIONS:'signs',RULES:'rules',RULE_VARIANTS:'rules',CONTROLS:'controls',CONTROL_VARIANTS:'controls',CONTROL_LESSONS:'controls',MOTORCYCLE_CONTROLS:'controls',HEAVY_CONTROLS:'controls',MOCK_EXTRA:'rules',ROW:'rules',MEMORY:'rules',STOPPING:'rules',REVISION:'rules',RHD_TIPS:'controls',DLTC_CHECKLIST:'application'};
const urls={signs:'https://www.natis.gov.za/index.php/downloads/learner-driver-manual/road-traffic-signs',rules:'https://www.natis.gov.za/index.php/downloads/learner-driver-manual/rules-of-the-road',controls:'https://www.natis.gov.za/index.php/downloads/learner-driver-manual/vehicle-controls',application:'https://www.gov.za/services/driving-licence/apply-learners-licence'};
const records=[];
for(const [name,topic] of Object.entries(sources)){
 const start=html.indexOf('const '+name+'=[');if(start<0)throw Error('Missing '+name);
 const close=/\n\s*\];/.exec(html.slice(start));if(!close)throw Error('Unclosed '+name);
 const end=start+close.index+close[0].length;
 const literal=html.slice(start+('const '+name+'=').length,end).replace(/;$/,'');
 const data=vm.runInNewContext('('+literal+')');
 for(const [i,item] of data.entries()){
  const itemTopic=name==='RHD_TIPS'&&i===4?'rules':topic;
  const content=Array.isArray(item)?item[1]||item[0]:item.q||item.name||item.t||item.scene||item.trick||item.speed;
  const digest=crypto.createHash('sha256').update(JSON.stringify(item)).digest('hex').slice(0,16);
  records.push({id:name.toLowerCase()+'-'+String(i+1).padStart(3,'0'),title:content,sha256_16:digest,source:urls[itemTopic],sourceArea:itemTopic,sourceMappingDate:'2026-10-04',reviewer:null,reviewDate:null,reviewStatus:'Independent subject review pending',language:'en'});
 }
}
const practicalStart=html.indexOf('const PRACTICAL_GUIDES={');
if(practicalStart<0)throw Error('Missing practical guides');
const practicalEnd=/\n\};/.exec(html.slice(practicalStart));
if(!practicalEnd)throw Error('Unclosed practical guides');
const practical=vm.runInNewContext('('+html.slice(practicalStart+'const PRACTICAL_GUIDES='.length,practicalStart+practicalEnd.index+practicalEnd[0].length).replace(/;$/,'')+')');
for(const [code,guide] of Object.entries(practical))for(const [i,step] of guide.steps.entries()){
 const digest=crypto.createHash('sha256').update(JSON.stringify(step)).digest('hex').slice(0,16);
 records.push({id:`practical-${code}-${i+1}`,title:step[0],sha256_16:digest,source:guide.source,sourceArea:'practical',sourceMappingDate:'2026-10-04',reviewer:null,reviewDate:null,reviewStatus:'Independent subject review pending',language:'en'});
}
const reviews=JSON.parse(fs.readFileSync('content-reviews.json','utf8'));
applyReviews(records,reviews.entries);
if(process.argv.includes('--require-reviewed'))requireReviewedRelease(records);
const output=JSON.stringify({schema:2,generated:'2026-10-05',note:'A source-area mapping is not an item-level fact check. Source checks are recorded separately from independent human review.',records},null,2)+'\n';
if(process.argv.includes('--check')){if(fs.readFileSync('content-register.json','utf8')!==output)throw Error('Content register is stale; regenerate and review changes.');}
else fs.writeFileSync('content-register.json',output);
console.log('Registered',records.length,'teaching entries; external review pending.');
