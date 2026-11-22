/* Isolated Chrome for exact viewport captures, media/JS emulation and fault injection. */
const fs=require('node:fs');
const assert=require('node:assert/strict');
const {createRequire}=require('node:module');
const puppeteer=createRequire('D:/besideyou/qa-tools/node_modules/_resolver.cjs')('puppeteer-core');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const result={entrance:[]};
async function main(){
 const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try {
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
 console.log(JSON.stringify(result,null,2));
 }finally{fs.writeFileSync('reports/round-2/entrance-checks.json',JSON.stringify(result,null,2));await browser.close();}
}
main().catch(e=>{console.error(e);process.exit(1)});
