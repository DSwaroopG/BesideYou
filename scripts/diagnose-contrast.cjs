const fs=require('node:fs');
const {createRequire}=require('node:module');
const puppeteer=createRequire('D:/besideyou/qa-tools/node_modules/_resolver.cjs')('puppeteer-core');
(async()=>{
 const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try {
  const page=await browser.newPage();await page.setViewport({width:1440,height:900});
  const logs=[];page.on('console',m=>{if(m.text().startsWith('[contrast-update]'))logs.push(m.text());});
  // Temporary log at the handler's --travel write; no shipped source changes.
  await page.evaluateOnNewDocument(()=>{window.contrastWrites=[];const set=CSSStyleDeclaration.prototype.setProperty;CSSStyleDeclaration.prototype.setProperty=function(name,value,priority){if(name==='--travel'){const log={scrollY,value,stack:new Error().stack};window.contrastWrites.push(log);console.debug('[contrast-update]',JSON.stringify(log));}return set.call(this,name,value,priority);};});
  await page.goto('http://localhost:3001/',{waitUntil:'networkidle0'});await page.waitForFunction(()=>!document.querySelector('.by-entrance'));
  const result={environment:await page.evaluate(()=>({reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,width:innerWidth,exists:!!document.querySelector('.by-motion-contrast')})),samples:[]};
  for(const offset of [0,400,800,1200,1600]){
   await page.evaluate(y=>scrollTo(0,y),offset);await new Promise(r=>setTimeout(r,100));
   result.samples.push(await page.evaluate(()=>{const root=document.querySelector('.by-motion-contrast');return {scrollY,travel:root.style.getPropertyValue('--travel'),enabled:root.dataset.motion,columns:[...document.querySelectorAll('.by-status-column,.by-owned-column')].map(e=>({transform:getComputedStyle(e).transform,transition:getComputedStyle(e).transition,headingTop:e.querySelector('h3').getBoundingClientRect().top})),writes:window.contrastWrites.length};}));
  }
  result.logs=logs;fs.writeFileSync('reports/fixes-9-10/diagnosis.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
