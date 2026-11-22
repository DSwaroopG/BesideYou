const fs=require('node:fs');
const path=require('node:path');
const { pathToFileURL }=require('node:url');
const qa=process.env.QA_MODULES || 'D:/besideyou/qa-tools/node_modules';
async function main(){
 const {default:lighthouse}=await import(pathToFileURL(path.join(qa,'lighthouse/core/index.js')).href);
 const {launch}=await import(pathToFileURL(path.join(qa,'chrome-launcher/dist/index.js')).href);
 const summary=[];
 for(const [name,route]of [['home','/'],['ai-consulting-firms','/outbound/ai-consulting-firms']]){
  const chrome=await launch({chromePath:process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',chromeFlags:['--headless=new','--disable-extensions','--no-first-run']});
  try{
   const result=await lighthouse('http://localhost:3001'+route,{port:chrome.port,output:['html','json'],logLevel:'error',onlyCategories:['performance','accessibility','best-practices','seo']});
   fs.writeFileSync(`reports/lighthouse-${name}.html`,result.report[0]);fs.writeFileSync(`reports/lighthouse-${name}.json`,result.report[1]);
   const lhr=result.lhr;const row={route,mode:lhr.configSettings.formFactor,throttling:lhr.configSettings.throttling,categories:Object.fromEntries(Object.entries(lhr.categories).map(([key,value])=>[key,Math.round(value.score*100)])),metrics:Object.fromEntries(['largest-contentful-paint','cumulative-layout-shift','total-blocking-time'].map(key=>[key,{value:lhr.audits[key].numericValue,display:lhr.audits[key].displayValue}])),failedAudits:Object.entries(lhr.audits).filter(([,a])=>a.score!==null&&a.score<1).map(([id,a])=>({id,title:a.title,score:a.score}))};summary.push(row);console.log(JSON.stringify(row,null,2));
  }finally{await chrome.kill();}
 }
 fs.writeFileSync('reports/lighthouse-summary.json',JSON.stringify(summary,null,2));
 if(summary.some(r=>r.categories.performance<90||r.metrics['largest-contentful-paint'].value>=2500))process.exitCode=1;
}
main().catch(e=>{console.error(e);process.exit(1)});
