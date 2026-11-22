/* Isolated Chrome for exact viewport captures, media/JS emulation and fault injection. */
const fs=require('node:fs');
const assert=require('node:assert/strict');
const {createRequire}=require('node:module');
const puppeteer=createRequire('D:/besideyou/qa-tools/node_modules/_resolver.cjs')('puppeteer-core');
const dir='reports/round-2';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const routes=['/','/how-it-works','/who-we-work-with','/the-pilot','/contact','/privacy','/terms',...['ai-consulting-firms','saas-development-companies','data-engineering-firms','dev-consultancies','bengaluru','mumbai'].map(s=>'/outbound/'+s)];
const result=process.env.QA_RESUME ? JSON.parse(fs.readFileSync('reports/round-2/browser-checks.json')) : {pages:[],entrance:[],gather:[],stack:[],contrast:[],hover:[],rules:[],errors:[]};
async function main(){
 const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--disable-extensions','--no-first-run']});
 try {
 const page=await browser.newPage();
 page.on('pageerror',e=>result.errors.push(e.message));
 await page.setViewport({width:1440,height:900});
 if(!process.env.QA_RESUME){
 for(const route of routes){
  const response=await page.goto('http://localhost:3001'+route,{waitUntil:'networkidle0'});assert.equal(response.status(),200);
  await page.waitForFunction(()=>!document.querySelector('.by-entrance'));
  const data=await page.evaluate(()=>({text:document.querySelector('main').innerText,faq:[...document.querySelectorAll('script[type="application/ld+json"]')].map(s=>JSON.parse(s.textContent)).filter(j=>j['@type']==='FAQPage').length,h1:document.querySelectorAll('h1').length,ruleCount:document.querySelectorAll('.by-rule-host').length}));
  assert.equal(data.faq,route==='/the-pilot'?1:0);assert.equal(data.h1,1);assert(!/—|lead generation/i.test(data.text));assert(data.ruleCount>0);
  for(const width of [375,768,1440]){
   await page.setViewport({width,height:900});
   const geometry=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,brand:document.querySelector('.by-wordmark').innerText,brandVisible:document.querySelector('.by-wordmark').getBoundingClientRect().width>0,social:[...document.querySelectorAll('.by-foot a[href*="linkedin"],.by-foot a[href*="x.com"],.by-foot a[href*="instagram"]')].map(a=>({top:a.getBoundingClientRect().top,left:a.getBoundingClientRect().left})),small:[...document.querySelectorAll('a,button')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.width<44||r.height<44)}).map(e=>e.textContent)}));
   assert(!geometry.overflow,route+' '+width+' overflow');assert.equal(geometry.brand,'BesideYou');assert(geometry.brandVisible);
   if(width>=768)assert(geometry.social.every((s,index)=>index===0||s.top>geometry.social[index-1].top));
   result.pages.push({route,width,...geometry,...data});
  }
  console.log('Page passed',route);
 }
 // Normal refresh timing, including restoration from a scrolled page.
 const timing=await browser.newPage();await timing.setViewport({width:375,height:900});
 await timing.evaluateOnNewDocument(()=>{
  window.entranceTrace={};let present=false;
  new MutationObserver(()=>{const e=document.querySelector('.by-entrance');const t=performance.now();if(e&&!present){window.entranceTrace.insert=t;present=true;}if(e?.dataset.started==='true'&&!window.entranceTrace.start)window.entranceTrace.start=t;if(e?.dataset.leaving==='true'&&!window.entranceTrace.leave)window.entranceTrace.leave=t;if(!e&&present&&!window.entranceTrace.remove)window.entranceTrace.remove=t;}).observe(document,{childList:true,subtree:true,attributes:true});
 });
 for(const route of ['/','/contact','/outbound/ai-consulting-firms']){
  await timing.goto('http://localhost:3001'+route,{waitUntil:'networkidle0'});await wait(2100);
  await timing.evaluate(()=>scrollTo(0,700));await timing.reload({waitUntil:'networkidle0'});await wait(2100);
  const trace=await timing.evaluate(()=>({...window.entranceTrace,scrollY,restoration:history.scrollRestoration}));
  assert.equal(trace.scrollY,0);assert.equal(trace.restoration,'manual');
  if(route==='/contact')assert(!trace.insert);else {assert(trace.insert);assert(trace.remove-trace.insert<2000);assert(trace.leave-trace.start-692>=200);}
  result.entrance.push({route,...trace});
 }
 await timing.goto('http://localhost:3001/',{waitUntil:'networkidle0'});await wait(2100);
 await timing.click('.by-hero .by-action');await timing.waitForFunction(()=>location.pathname==='/contact');assert.equal(await timing.$('.by-entrance'),null);
 await timing.click('header .by-mark');await timing.waitForFunction(()=>location.pathname==='/');assert.equal(await timing.$('.by-entrance'),null);result.clientNavigationSilent=true;await timing.close();
 const blocked=await browser.newPage();await blocked.evaluateOnNewDocument(()=>{Object.defineProperty(document.fonts,'ready',{get:()=>new Promise(()=>{})});window.overlayTimes={};let seen=false;new MutationObserver(()=>{const e=document.querySelector('.by-entrance');if(e&&!seen){seen=true;window.overlayTimes.start=performance.now();}if(!e&&seen&&!window.overlayTimes.end)window.overlayTimes.end=performance.now();}).observe(document,{childList:true,subtree:true});});
 await blocked.goto('http://localhost:3001/',{waitUntil:'networkidle0'});await wait(2100);const blockedTime=await blocked.evaluate(()=>window.overlayTimes);assert(blockedTime.end-blockedTime.start<2000);result.blockedFonts=blockedTime;await blocked.close();
 }
 // All routes retain visible rules without JS and with reduced motion.
 if(process.env.QA_RESUME!=='motion'){
 result.rules=[];
 for(const mode of ['no-js','reduced']){
  const fallback=await browser.newPage();await fallback.setViewport({width:375,height:900});
  if(mode==='no-js')await fallback.setJavaScriptEnabled(false);else await fallback.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
  for(const route of routes){await fallback.goto('http://localhost:3001'+route,{waitUntil:'networkidle0'});const check=await fallback.evaluate(()=>({overlay:!!document.querySelector('.by-entrance'),pending:document.querySelectorAll('.by-rule-pending').length,animations:document.getAnimations().filter(a=>a.playState==='running').length,visible:[...document.querySelectorAll('.by-rule-host')].every(e=>getComputedStyle(e,e.matches('.by-top')?'::after':'::before').transform==='matrix(1, 0, 0, 1, 0, 0)')}));assert(!check.overlay);assert.equal(check.pending,0);if(mode==='reduced')assert.equal(check.animations,0);assert(check.visible);result.rules.push({route,mode,...check});}
  await fallback.close();
 }
 }
 await page.bringToFront();await page.setViewport({width:1440,height:1100});await page.goto('http://localhost:3001/',{waitUntil:'networkidle0'});await page.waitForFunction(()=>!document.querySelector('.by-entrance'));
 result.gather=[];
 await page.waitForFunction(()=>document.querySelector('.by-hero-dot').getAttribute('opacity')==='1');await wait(550);
 for(const width of [375,768,1440]){
  await page.setViewport({width,height:1100});await page.evaluate(()=>scrollTo(0,0));const hero=await page.$('.by-hero');const box=await hero.boundingBox();
  for(const [name,fx,fy]of [['top-left',.01,.01],['top-right',.99,.01],['bottom-left',.01,.99],['bottom-right',.99,.99],['centre',.5,.5]]){
   await page.mouse.move(box.x+box.width*fx,box.y+box.height*fy);await wait(180);
   await wait(1400);
   const state=await page.$eval('.by-hero',root=>({aim:root.dataset.aim,ticks:[...root.querySelectorAll('line')].map(e=>Number(e.getAttribute('opacity'))),radius:Number(root.querySelector('circle').getAttribute('r')),path:root.querySelector('path').getAttribute('d'),textBackground:getComputedStyle(root.querySelector('h1')).backgroundColor}));assert.equal(state.aim,'on');assert(state.ticks.every(v=>v>.95));assert(Math.abs(state.radius-4)<.1);assert(state.path);assert.equal(state.textBackground,'rgba(0, 0, 0, 0)');result.gather.push({width,name,...state});
   if(width===1440&&['centre','bottom-right'].includes(name))await page.screenshot({path:`${dir}/hero-${name}.png`});
  }
 }
 // Rules are armed offscreen, draw once and remain drawn after scrolling away.
 await page.setViewport({width:1440,height:900});await page.goto('http://localhost:3001/the-pilot',{waitUntil:'networkidle0'});await page.waitForFunction(()=>!document.querySelector('.by-entrance'));
 const pending=await page.$eval('.by-section:last-of-type',e=>e.classList.contains('by-rule-pending'));assert(pending);
 await page.$eval('.by-section:last-of-type',e=>e.scrollIntoView({block:'center'}));await wait(850);assert.equal(await page.$eval('.by-section:last-of-type',e=>getComputedStyle(e,'::before').transform),'matrix(1, 0, 0, 1, 0, 0)');await page.evaluate(()=>scrollTo(0,0));await wait(50);assert.equal(await page.$eval('.by-section:last-of-type',e=>e.classList.contains('by-rule-pending')),false);result.ruleOnce=true;
 // Desktop stack and counter-scroll geometry plus requested captures.
 await page.goto('http://localhost:3001/how-it-works',{waitUntil:'networkidle0'});await page.waitForFunction(()=>!document.querySelector('.by-entrance'));
 const stackTop=await page.$eval('.by-step-list',e=>e.getBoundingClientRect().top+scrollY);
 for(const [i,offset]of [0,400,800].entries()){
  await page.evaluate(y=>scrollTo(0,y),stackTop-96+offset);await wait(100);
  const cards=await page.$$eval('.by-step-layer',es=>es.map(e=>({top:e.getBoundingClientRect().top,height:e.offsetHeight,sticky:getComputedStyle(e).top,opacity:getComputedStyle(e).opacity,transform:getComputedStyle(e).transform})));result.stack.push({offset,cards});await page.screenshot({path:`${dir}/stack-${i+1}.png`});
 }
 assert.deepEqual(result.stack[0].cards.map(c=>c.sticky),['96px','132px','168px','204px']);
 for(const width of [1024,1440]){
  await page.setViewport({width,height:900});await page.goto('http://localhost:3001/',{waitUntil:'networkidle0'});await page.waitForFunction(()=>!document.querySelector('.by-entrance'));
  const range=await page.$eval('.by-contrast',e=>({start:e.offsetTop-500,end:e.offsetTop+e.offsetHeight}));
  for(let y=range.start;y<=range.end;y+=100){await page.evaluate(y=>scrollTo(0,y),y);await wait(35);const c=await page.evaluate(()=>{const s=document.querySelector('.by-contrast').getBoundingClientRect();return {travel:Number(document.querySelector('.by-motion-contrast').style.getPropertyValue('--travel')),contained:[...document.querySelectorAll('.by-status-column,.by-owned-column')].every(e=>{const r=e.getBoundingClientRect();return r.top>=s.top&&r.bottom<=s.bottom})};});assert(c.contained,'counter-scroll containment '+JSON.stringify(c));result.contrast.push({width,y,...c});}
  if(width===1440)for(const [name,y]of [['top',range.start+300],['bottom',range.end-700]]){await page.evaluate(y=>scrollTo(0,y),y);await wait(100);await page.screenshot({path:`${dir}/difference-${name}.png`});}
 }
 await page.goto('http://localhost:3001/outbound/ai-consulting-firms',{waitUntil:'networkidle0'});await page.waitForFunction(()=>!document.querySelector('.by-entrance'));for(let y=0;y<await page.evaluate(()=>document.body.scrollHeight);y+=500){await page.evaluate(y=>scrollTo(0,y),y);await wait(60);}await page.evaluate(()=>scrollTo(0,0));await wait(850);await page.screenshot({path:`${dir}/money-page.png`,fullPage:true});
 assert.equal(result.errors.length,0);
 console.log('Round 2 browser checks passed');
 }finally{fs.writeFileSync(`${dir}/browser-checks.json`,JSON.stringify(result,null,2));await browser.close();}
}
main().catch(e=>{console.error(e);process.exit(1)});
