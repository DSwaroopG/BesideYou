const fs=require('node:fs');const assert=require('node:assert/strict');
const {createRequire}=require('node:module');const puppeteer=createRequire('D:/besideyou/qa-tools/node_modules/_resolver.cjs')('puppeteer-core');
const wait=ms=>new Promise(r=>setTimeout(r,ms));const dir='reports/fixes-9-10';
const result={contrast:[],process:[],fallbacks:[],errors:[]};
async function main(){
 const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
 const page=await browser.newPage();page.on('pageerror',e=>result.errors.push(e.message));await page.setViewport({width:1440,height:720});
 await page.goto('http://localhost:3001/',{waitUntil:'networkidle0'});await page.waitForFunction(()=>!document.querySelector('.by-entrance'));
 result.reduced=await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);assert.equal(result.reduced,false);
 const bounds=await page.$eval('.by-contrast',e=>{const r=e.getBoundingClientRect();return{x:r.left,y:r.top+scrollY,width:r.width,height:r.height}});
 const start=bounds.y-720,end=bounds.y+bounds.height;
 for(let i=0;i<5;i++){
  const target=start+(end-start)*i/4;await page.evaluate(y=>scrollTo(0,y),target);await wait(100);
  const m=await page.evaluate(()=>{const section=document.querySelector('.by-contrast'),s=section.getBoundingClientRect(),root=section.querySelector('.by-motion-contrast');return {scrollY,travel:Number(root.style.getPropertyValue('--travel')),headings:[...section.querySelectorAll('h3')].map(e=>({top:e.getBoundingClientRect().top+scrollY,transform:getComputedStyle(e).transform})),rows:[...section.querySelectorAll('.by-status-column,.by-owned-column')].map(e=>{const r=e.getBoundingClientRect();return{top:r.top+scrollY,bottom:r.bottom+scrollY,transform:getComputedStyle(e).transform,contained:r.top>=s.top&&r.bottom<=s.bottom}})};});
  assert(Math.abs(m.headings[0].top-m.headings[1].top)<.1);assert(m.headings.every(h=>h.transform==='none'));assert(m.rows.every(r=>r.contained));assert(Math.abs(m.travel-i*30)<.15);result.contrast.push(m);
  await page.screenshot({path:`${dir}/difference-${i+1}.png`,clip:bounds,captureBeyondViewport:true});assert.equal(await page.evaluate(()=>scrollY),m.scrollY,'capture must not change scroll');
 }
 assert(result.contrast.every(m=>m.headings[0].top===result.contrast[0].headings[0].top));
 for(const width of [768,1024,1440]){
  await page.setViewport({width,height:720});
  const b=await page.$eval('.by-contrast',e=>({top:e.getBoundingClientRect().top+scrollY,height:e.offsetHeight}));
  for(let y=Math.max(0,b.top-720);y<b.top+b.height+100;y+=80){await page.evaluate(y=>scrollTo(0,y),y);await wait(25);assert(await page.$eval('.by-contrast',e=>{const s=e.getBoundingClientRect();return [...e.querySelectorAll('.by-status-column,.by-owned-column')].every(c=>{const r=c.getBoundingClientRect();return r.top>=s.top&&r.bottom<=s.bottom})}),`containment ${width}/${y}`);}
 }
 await page.setViewport({width:1440,height:720});await page.reload({waitUntil:'networkidle0'});await page.waitForFunction(()=>!document.querySelector('.by-entrance'));
 const processBounds=await page.$eval('.by-process-row',e=>{const r=e.getBoundingClientRect();return{x:r.left,y:r.top+scrollY,width:r.width,height:r.height}});
 const processState=()=>page.$$eval('.by-process-row h3',es=>es.map(e=>{const s=getComputedStyle(e,'::after');return {ruleTransform:s.transform,duration:s.transitionDuration,delay:s.transitionDelay,textTransform:getComputedStyle(e).transform,textOpacity:getComputedStyle(e).opacity}}));
 assert(await page.$eval('.by-process-row',e=>e.classList.contains('by-rule-pending')));
 result.process.push(await processState());await page.screenshot({path:`${dir}/process-1.png`,clip:processBounds,captureBeyondViewport:true});
 await page.$eval('.by-process-row',e=>e.scrollIntoView({block:'center'}));await wait(300);await page.evaluate(()=>document.getAnimations().forEach(a=>a.pause()));result.process.push(await processState());await page.screenshot({path:`${dir}/process-2.png`,clip:processBounds,captureBeyondViewport:true});
 await page.evaluate(()=>document.getAnimations().forEach(a=>a.play()));await wait(850);result.process.push(await processState());await page.screenshot({path:`${dir}/process-3.png`,clip:processBounds,captureBeyondViewport:true});
 assert(result.process[0].every(p=>p.ruleTransform==='matrix(0, 0, 0, 1, 0, 0)'));
 assert.deepEqual(result.process[1].map(p=>p.delay),['0s','0.12s','0.24s','0.36s']);assert(result.process[1].every(p=>p.duration==='0.6s'));
 assert(result.process[2].every(p=>p.ruleTransform==='matrix(1, 0, 0, 1, 0, 0)'));
 assert(result.process.flat().every(p=>p.textTransform==='none'&&p.textOpacity==='1'));
 await page.evaluate(()=>scrollTo(0,0));await page.$eval('.by-process-row',e=>e.scrollIntoView());assert(!(await page.$eval('.by-process-row',e=>e.classList.contains('by-rule-pending'))));result.once=true;
 // True OS preference remains unchanged. These isolated contexts test fallbacks.
 for(const mode of ['mobile','reduced','no-js']){
  const p=await browser.newPage();await p.setViewport({width:mode==='mobile'?375:1440,height:900});
  if(mode==='reduced')await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);if(mode==='no-js')await p.setJavaScriptEnabled(false);
  await p.goto('http://localhost:3001/',{waitUntil:'networkidle0'});await wait(1500);
  const m=await p.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,rows:[...document.querySelectorAll('.by-status-column,.by-owned-column')].map(e=>getComputedStyle(e).transform),rules:[...document.querySelectorAll('.by-process-row h3')].map(e=>getComputedStyle(e,'::after').transform),headings:[...document.querySelectorAll('.by-contrast h3')].map(e=>({top:e.getBoundingClientRect().top,bottom:e.getBoundingClientRect().bottom})),running:document.getAnimations().filter(a=>a.playState==='running').length,copy:document.querySelector('main').innerText}));
  assert(!m.overflow);assert(m.rows.every(t=>t==='none'));assert(m.rules.every(t=>t==='matrix(1, 0, 0, 1, 0, 0)'));assert(!/—|lead generation/i.test(m.copy));if(mode==='reduced')assert.equal(m.running,0);if(mode==='mobile')assert(m.headings[1].top>m.headings[0].bottom);result.fallbacks.push({mode,...m});await p.close();
 }
 assert.equal(result.errors.length,0);console.log('Fixes 9 and 10: all browser checks passed');
 }finally{fs.writeFileSync(`${dir}/checks.json`,JSON.stringify(result,null,2));await browser.close();}
}
main().catch(e=>{console.error(e);process.exit(1)});
