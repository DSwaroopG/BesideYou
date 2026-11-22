const fs=require('node:fs');const assert=require('node:assert/strict');
const {createRequire}=require('node:module');const puppeteer=createRequire('D:/besideyou/qa-tools/node_modules/_resolver.cjs')('puppeteer-core');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function main(){
 const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});const results=[];
 try{const p=await browser.newPage();await p.setViewport({width:1440,height:900});
 for(const [route,selector,child,pseudo,property,hoverSelector] of [
  ['/','.by-hero .by-action','span',null,'transform'],
  ['/','.by-flow .by-text-link',null,'::after','transform'],
  ['/','.by-nav-dot',null,null,'transform','.by-navlinks a:nth-child(2)'],
  ['/who-we-work-with','.by-company','h2',null,'transform'],
  ['/the-pilot','.by-questions summary','span',null,'transform']]){
  await p.goto('http://localhost:3001'+route,{waitUntil:'networkidle0'});await p.waitForFunction(()=>!document.querySelector('.by-entrance'));await p.$eval(selector,e=>e.scrollIntoView({block:'center'}));await p.mouse.move(0,0);await wait(250);
  const read=()=>p.$eval(selector,(e,c,ps,prop)=>{const s=getComputedStyle(c?e.querySelector(c):e,ps);return {value:s[prop],duration:s.transitionDuration}},child,pseudo,property);
  const before=await read();await p.hover(hoverSelector||selector);await wait(250);const after=await read();assert.notEqual(before.value,after.value,selector);results.push({route,selector,before,after});
  await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);assert.equal((await read()).duration,'0s');await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'no-preference'}]);
 }
 await p.setViewport({width:375,height:900});await p.goto('http://localhost:3001/contact',{waitUntil:'networkidle0'});await p.click('button[type=submit]');const errors=await p.$$eval('.by-field-error',es=>es.map(e=>({text:e.textContent,font:getComputedStyle(e).fontSize})));assert.equal(errors.length,4);assert(errors.every(e=>e.font==='15px'));results.push({formErrors:errors});
 console.log('Hover and mobile error checks passed');
 }finally{fs.writeFileSync('reports/round-2/hover-checks.json',JSON.stringify(results,null,2));await browser.close();}
}
main().catch(e=>{console.error(e);process.exit(1)});
