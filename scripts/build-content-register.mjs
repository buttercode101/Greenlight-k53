import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
const html=fs.readFileSync('index.html','utf8');
const sources={SIGNS:'signs',MARKINGS:'signs',RULES:'rules',CONTROLS:'controls',MOTORCYCLE_CONTROLS:'controls',HEAVY_CONTROLS:'controls',MOCK_EXTRA:'rules',ROW:'rules',MEMORY:'rules',STOPPING:'rules',REVISION:'rules'};
const urls={signs:'https://www.natis.gov.za/index.php/downloads/learner-driver-manual/road-traffic-signs',rules:'https://www.natis.gov.za/index.php/downloads/learner-driver-manual/rules-of-the-road',controls:'https://www.natis.gov.za/index.php/downloads/learner-driver-manual/vehicle-controls'};
const records=[];
for(const [name,topic] of Object.entries(sources)){
 const start=html.indexOf('const '+name+'=[');if(start<0)throw Error('Missing '+name);
 const end=html.indexOf('\n];',start);if(end<0)throw Error('Unclosed '+name);
 const literal=html.slice(start+('const '+name+'=').length,end+2);
 const data=vm.runInNewContext('('+literal+')');
 for(const [i,item] of data.entries()){
  const content=item.q||item.name||item.t||item.scene||item.trick||item.speed;
  const digest=crypto.createHash('sha256').update(JSON.stringify(item)).digest('hex').slice(0,16);
  records.push({id:name.toLowerCase()+'-'+String(i+1).padStart(3,'0'),title:content,sha256_16:digest,source:urls[topic],sourceArea:topic,sourceMappingDate:'2026-10-03',reviewer:null,reviewDate:null,reviewStatus:'Independent subject review pending',language:'en'});
 }
}
const output=JSON.stringify({schema:1,generated:'2026-10-03',note:'A source-area mapping is not an item-level fact check. No human or qualified reviewer is implied.',records},null,2)+'\n';
if(process.argv.includes('--check')){if(fs.readFileSync('content-register.json','utf8')!==output)throw Error('Content register is stale; regenerate and review changes.');}
else fs.writeFileSync('content-register.json',output);
console.log('Registered',records.length,'teaching entries; external review pending.');
