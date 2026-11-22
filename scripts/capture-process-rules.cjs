const fs=require('node:fs');const {createRequire}=require('node:module');
const puppeteer=createRequire('D:/besideyou/qa-tools/node_modules/_resolver.cjs')('puppeteer-core');
(async()=>{const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{const page=await browser.newPage();await page.setViewport({width:1440,height:720});await page.goto('http://localhost:3001/',{waitUntil:'networkidle0'});await page.waitForFunction(()=>!document.querySelector('.by-entrance'));
await page.$eval('.by-process-row',e=>e.scrollIntoView({block:'center'}));
await page.waitForFunction(()=>document.getAnimations().filter(a=>a.effect?.target?.matches?.('.by-process-row h3')).length===4);
await page.evaluate(async()=>{window.ruleAnimations=document.getAnimations().filter(a=>a.effect?.target?.matches?.('.by-process-row h3'));window.ruleAnimations.forEach(a=>a.pause());await Promise.all(window.ruleAnimations.map(a=>a.ready));});
const samples=[];
for(const [i,time]of [0,300,1000].entries()){
 await page.evaluate(time=>{window.ruleAnimations.forEach(a=>a.currentTime=time);},time);
 await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 samples.push({time,scales:await page.$$eval('.by-process-row h3',es=>es.map(e=>getComputedStyle(e,'::after').transform))});
 await page.screenshot({path:`reports/fixes-9-10/process-${i+1}.png`});
}
fs.writeFileSync('reports/fixes-9-10/process-capture.json',JSON.stringify(samples,null,2));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
