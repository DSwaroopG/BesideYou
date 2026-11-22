/* Isolated production test browser: viewport captures, disabled JS, media emulation,
   font-failure injection and mocked form requests. No real booking is sent.
   Usage: QA_MODULES=D:/besideyou/qa-tools/node_modules node scripts/verify-production.cjs */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const { createRequire }=require('node:module');
const qaRequire=createRequire(path.join(process.env.QA_MODULES || 'D:/besideyou/qa-tools/node_modules','_resolver.cjs'));
const puppeteer=qaRequire('puppeteer-core');
const base=process.env.QA_URL || 'http://localhost:3001';
const routes=['/','/how-it-works','/who-we-work-with','/the-pilot','/contact','/privacy','/terms','/outbound/ai-consulting-firms','/outbound/saas-development-companies','/outbound/data-engineering-firms','/outbound/dev-consultancies','/outbound/bengaluru','/outbound/mumbai'];
const widths=[320,360,375,414,768,1024,1440];
const reports={routes:[],viewports:[],noJavaScript:[],reducedMotion:[],interactions:{},entrance:[],errors:[]};
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const slug=r=>r==='/'?'home':r.slice(1).replaceAll('/','-');
fs.mkdirSync('reports/screenshots',{recursive:true});

async function main(){
 const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,protocolTimeout:30000,args:['--disable-extensions','--no-first-run']});
 try {
 const page=await browser.newPage();
 page.on('pageerror',error=>reports.errors.push(error.message));
 await page.evaluateOnNewDocument(()=>sessionStorage.setItem('by_entered','1'));
 const titles=new Set(); const incoming=new Set(['/']);
 if(process.env.QA_RESUME_INTERACTIONS){const saved=JSON.parse(fs.readFileSync('reports/production-checks.json'));reports.routes=saved.routes;reports.viewports=saved.viewports;reports.assets=saved.assets;}
 else {
 for(const route of routes){
  const response=await page.goto(base+route,{waitUntil:'networkidle0'});
  const raw=await response.text();
  const info=await page.evaluate(()=>{
   const main=document.querySelector('main');
   const headings=[...main.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h=>({level:Number(h.tagName.slice(1)),text:h.textContent,hidden:h.getAttribute('aria-hidden')}));
   return {title:document.title,description:document.querySelector('meta[name="description"]')?.content,headings,text:main.innerText,json:[...document.querySelectorAll('script[type="application/ld+json"]')].map(s=>JSON.parse(s.textContent)),links:[...document.querySelectorAll('a[href^="/"]')].map(a=>a.getAttribute('href')),og:document.querySelector('meta[property="og:image"]')?.content,twitter:document.querySelector('meta[name="twitter:image"]')?.content,robots:document.querySelector('meta[name="robots"]')?.content,fontFiles:performance.getEntriesByType('resource').filter(r=>/woff/.test(r.name)).map(r=>r.name)};
  });
  assert.equal(response.status(),200,route); assert.equal((raw.match(/<h1[ >]/g)||[]).length,1,route+' SSR H1');
  assert.equal(info.headings.filter(h=>h.level===1).length,1); assert(info.headings.every((h,i)=>h.hidden!=='true'&&(!i||h.level<=info.headings[i-1].level+1)),route+' headings');
  assert(!titles.has(info.title));titles.add(info.title);assert(info.description);assert(!/lead generation|—/i.test(info.text));
  assert(!raw.includes('class="by-entrance"'));assert(info.og.endsWith('/og-image.png'));assert(info.twitter.endsWith('/og-image.png'));
  assert(info.json.some(j=>j['@type']==='Organization')); if(route.includes('/outbound/')||route==='/the-pilot'){const faq=info.json.find(j=>j['@type']==='FAQPage');assert.equal(faq.mainEntity.length,route==='/the-pilot'?6:3);}
  if(route.includes('/outbound/'))assert(info.json.some(j=>j['@type']==='BreadcrumbList'));
  if(['/privacy','/terms'].includes(route))assert(info.robots.includes('noindex'));
  info.links.forEach(link=>incoming.add(link));
  reports.routes.push({route,status:response.status(),serverH1:1,...info});
  for(const width of widths){
   await page.setViewport({width,height:900,deviceScaleFactor:1});
   await page.evaluate(()=>window.scrollTo(0,0));
   await wait(60);
   const metrics=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,h1Opacity:getComputedStyle(document.querySelector('h1')).opacity,smallText:[...document.querySelectorAll('main *,header *,footer *')].filter(e=>e.childNodes.length&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&e.getBoundingClientRect().width&&getComputedStyle(e).visibility!=='hidden'&&Number.parseFloat(getComputedStyle(e).fontSize)<12).map(e=>({text:e.textContent,size:getComputedStyle(e).fontSize})),smallTargets:[...document.querySelectorAll('a,button,input,textarea,summary')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.height&&(r.width<43.9||r.height<43.9)}).map(e=>({text:e.textContent,width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height})),inputs:[...document.querySelectorAll('input,textarea')].map(e=>({height:e.getBoundingClientRect().height,font:getComputedStyle(e).fontSize}))}));
   assert(metrics.scroll<=width,route+' overflow '+width);assert.equal(metrics.h1Opacity,'1');
   if(width<768){assert.equal(metrics.smallText.length,0,JSON.stringify(metrics.smallText));assert.equal(metrics.smallTargets.length,0,JSON.stringify(metrics.smallTargets));}
   assert(metrics.inputs.every(i=>i.height>=48&&i.font==='16px'));
   reports.viewports.push({route,...metrics});
   if([375,1440].includes(width)){
    await page.evaluate(()=>scrollTo(0,document.body.scrollHeight));
    await page.waitForFunction(()=>[...document.images].every(image=>image.complete&&image.naturalWidth>0));
    await page.evaluate(()=>scrollTo(0,0));await wait(80);
    await page.screenshot({path:`reports/screenshots/${slug(route)}-${width}.png`,fullPage:true});
   }
  }
  console.log('Routes and seven widths passed:',route);
 }
 assert(routes.every(r=>incoming.has(r)),'Orphan page');
 const sitemap=await (await fetch(base+'/sitemap.xml')).text();assert.equal((sitemap.match(/<loc>/g)||[]).length,11);assert(!/\/privacy|\/terms/.test(sitemap));
 const robots=await (await fetch(base+'/robots.txt')).text();assert(robots.includes('Allow: /')&&robots.includes('https://besideyou.io/sitemap.xml'));
 const og=await fetch(base+'/og-image.png');assert.equal(og.status,200);const png=Buffer.from(await og.arrayBuffer());assert.equal(png.readUInt32BE(16),1200);assert.equal(png.readUInt32BE(20),630);
 reports.assets={sitemap:11,robots:true,og:{status:200,width:1200,height:630},noOrphans:true};
 }
 if(process.env.QA_RESUME_FORMS){const saved=JSON.parse(fs.readFileSync('reports/production-checks.json'));reports.noJavaScript=saved.noJavaScript;reports.reducedMotion=saved.reducedMotion;reports.interactions.nativeFaqWithoutJs=saved.interactions.nativeFaqWithoutJs;}
 else {
 const nojs=await browser.newPage();await nojs.setJavaScriptEnabled(false);await nojs.setViewport({width:375,height:900});
 for(const route of routes){await nojs.goto(base+route,{waitUntil:'networkidle0'});const state=await nojs.evaluate(()=>({text:document.querySelector('main').innerText,h1:document.querySelector('h1')?.innerText,opacity:getComputedStyle(document.querySelector('main')).opacity,overlay:!!document.querySelector('.by-entrance'),scroll:document.documentElement.scrollWidth}));assert(state.h1&&state.text.length>state.h1.length&&state.opacity==='1'&&!state.overlay&&state.scroll<=375,route+': '+JSON.stringify(state));reports.noJavaScript.push({route,...state});}
 await nojs.goto(base+'/the-pilot');await nojs.click('summary');assert(await nojs.$eval('details',e=>e.open));reports.interactions.nativeFaqWithoutJs=true;
 const reduced=await browser.newPage();await reduced.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
 for(const route of routes){await reduced.goto(base+route,{waitUntil:'networkidle0'});const result=await reduced.evaluate(()=>({overlay:!!document.querySelector('.by-entrance'),animations:document.getAnimations().filter(a=>a.playState==='running').length,cards:[...document.querySelectorAll('.by-step-card')].map(c=>({position:getComputedStyle(c).position,opacity:getComputedStyle(c).opacity,transform:getComputedStyle(c).transform}))}));assert(!result.overlay&&result.animations===0);assert(result.cards.every(c=>c.position==='static'&&c.opacity==='1'&&c.transform==='none'));reports.reducedMotion.push({route,...result});}
 console.log('JavaScript-disabled and reduced-motion checks passed on all routes');
 await nojs.close();await reduced.close();
 }
 await page.bringToFront();
 console.log('Testing form validation');
 // Intercept the existing API contract at the browser boundary. Nothing is sent upstream.
 await page.setRequestInterception(true);let requests=[];let outcome='success';
 page.on('request',request=>{if(request.url().endsWith('/api/book-session')){requests.push(JSON.parse(request.postData()));void wait(150).then(()=>outcome==='network'?request.abort('failed'):request.respond({status:outcome==='error'?502:200,contentType:'application/json',body:JSON.stringify({ok:outcome==='success'})}));}else request.continue();});
 await page.goto(base+'/contact',{waitUntil:'networkidle0'});await page.click('button[type=submit]');
 console.log('Empty form submitted locally');
 assert.equal(await page.$$eval('.by-field-error',nodes=>nodes.length),4);assert.equal(requests.length,0);
 await page.type('#name','Test User');assert.equal(await page.$$eval('.by-field-error',nodes=>nodes.length),3);
 await page.type('#company','Test Company');await page.type('#email','invalid');await page.type('#current_outbound_state','Test only');await page.click('button[type=submit]');assert.equal(requests.length,0);assert.equal(await page.$eval('#email-error',e=>e.textContent),'Enter a valid work email.');
 await page.$eval('#email',e=>e.value='');await page.type('#email','test@example.com');await page.click('button[type=submit]');assert.equal(await page.$eval('button[type=submit]',e=>e.disabled),true);await page.waitForSelector('.by-form-success');
 console.log('Successful mocked form response verified');
 assert.deepEqual(Object.keys(requests[0]).sort(),['name','company','role','email','primary_growth_objective','current_outbound_state'].sort());assert.equal(requests[0].role,'');assert.equal(requests[0].primary_growth_objective,'');
 for(const failure of ['error','network']){outcome=failure;await page.goto(base+'/contact',{waitUntil:'networkidle0'});for(const [field,value]of Object.entries({name:'Test User',company:'Test Company',email:'test@example.com',current_outbound_state:'Test only'}))await page.type('#'+field,value);await page.click('button[type=submit]');await page.waitForSelector('[role=alert]');assert.equal(await page.$eval('#name',e=>e.value),'Test User');assert.equal(await page.$eval('button[type=submit]',e=>e.disabled),false);}
 reports.interactions.form={emptyRequired:4,invalidEmailBlocked:true,errorsClearOnEdit:true,payload:requests[0],success:true,httpFailure:true,networkFailure:true,externalRequestsSent:0};
 console.log('All form cases passed');
 await page.setViewport({width:1440,height:900});await page.evaluate(()=>scrollTo(0,0));await page.mouse.move(200,150);await wait(1600);const gather=await page.$eval('.by-hero',e=>({aim:e.dataset.aim,hidden:e.querySelector('svg').getAttribute('aria-hidden'),ticks:[...e.querySelectorAll('line')].map(t=>Number(t.getAttribute('opacity')))}));assert(gather.aim==='on'&&gather.hidden==='true'&&gather.ticks.every(v=>v>.95));reports.interactions.gather=gather;
 const rolling=await page.$eval('.by-hero-roll',e=>({font:getComputedStyle(e).fontSize,subFont:getComputedStyle(e.parentElement).fontSize,overflow:getComputedStyle(e).overflow,spans:e.children.length}));assert(rolling.font===rolling.subFont&&rolling.overflow==='hidden'&&rolling.spans<=2);reports.interactions.rollingPhrase=rolling;
 const touchPage=await browser.newPage();await touchPage.setViewport({width:375,height:900,isMobile:true,hasTouch:true});await touchPage.goto(base,{waitUntil:'networkidle0'});await touchPage.bringToFront();await touchPage.touchscreen.touchStart(50,110);await touchPage.touchscreen.touchMove(90,140);const touch=await touchPage.$eval('.by-hero',e=>({aim:e.dataset.aim,path:e.querySelector('path').getAttribute('d')}));assert(touch.aim==='off'&&touch.path);await touchPage.touchscreen.touchEnd();reports.interactions.touchDrift=touch;await touchPage.close();await page.bringToFront();
 await page.evaluate(()=>scrollTo(0,document.querySelector('.by-motion-contrast').offsetTop-800));await wait(100);const before=await page.$eval('.by-motion-contrast',e=>Number(e.style.getPropertyValue('--travel')));await page.evaluate(()=>scrollBy(0,500));await wait(100);const after=await page.$eval('.by-motion-contrast',e=>Number(e.style.getPropertyValue('--travel')));assert(after>before&&after<=60);reports.interactions.counterScroll={before,after,max:60};
 await page.goto(base+'/how-it-works',{waitUntil:'networkidle0'});await page.evaluate(()=>scrollTo(0,document.querySelectorAll('.by-step-card')[2].offsetTop-144));await wait(100);const stack=await page.$$eval('.by-step-card',nodes=>nodes.map(e=>({position:getComputedStyle(e).position,opacity:Number(getComputedStyle(e).opacity),transform:getComputedStyle(e).transform})));assert(stack[0].position==='sticky'&&stack[0].opacity<=.66);reports.interactions.stack=stack;
 // Fresh isolated contexts exercise first visit, navigation persistence, and failures.
 for(const scenario of ['normal','fonts-never-ready','fonts-rejected','storage-denied','contact']){
  console.log('Testing entrance:',scenario);
  const context=await browser.createBrowserContext();const entrance=await context.newPage();
  await entrance.evaluateOnNewDocument(mode=>{
   window.__entranceEvents=[];
   if(mode==='fonts-never-ready')Object.defineProperty(document.fonts,'ready',{get:()=>new Promise(()=>{})});
   if(mode==='fonts-rejected')Object.defineProperty(document.fonts,'ready',{get:()=>Promise.reject(new Error('Font test rejection'))});
   if(mode==='storage-denied')Storage.prototype.getItem=function(){throw new Error('Storage denied for test');};
   new MutationObserver(records=>{for(const record of records){for(const node of record.addedNodes)if(node.nodeType===1&&node.classList?.contains('by-entrance'))window.__entranceEvents.push({event:'added',at:performance.now(),mainOpacity:getComputedStyle(document.querySelector('main')).opacity,letters:node.querySelectorAll('span').length});for(const node of record.removedNodes)if(node.nodeType===1&&node.classList?.contains('by-entrance'))window.__entranceEvents.push({event:'removed',at:performance.now()});}}).observe(document,{childList:true,subtree:true});
  },scenario);
  if(scenario.startsWith('fonts-')){await entrance.setRequestInterception(true);entrance.on('request',r=>r.resourceType()==='font'?r.abort('failed'):r.continue());}
  await entrance.goto(base+(scenario==='contact'?'/contact':'/'),{waitUntil:'domcontentloaded'});await wait(2000);
  const events=await entrance.evaluate(()=>window.__entranceEvents);assert.equal(await entrance.$('.by-entrance'),null);
  if(scenario==='contact')assert.equal(events.length,0);else{assert.equal(events.length,2);assert.equal(events[0].letters,9);assert.equal(events[0].mainOpacity,'1');assert(events[1].at-events[0].at<=1600,JSON.stringify(events));}
  if(scenario==='normal'){
   const tour=['/how-it-works','/who-we-work-with','/outbound/ai-consulting-firms','/outbound/saas-development-companies','/outbound/data-engineering-firms','/outbound/dev-consultancies','/outbound/bengaluru','/outbound/mumbai','/the-pilot','/contact','/privacy','/terms','/'];
   for(const route of tour){await entrance.click(`a[href="${route}"]`);await entrance.waitForFunction(p=>location.pathname===p,{},route);assert.equal(await entrance.$('.by-entrance'),null);}
   assert.equal((await entrance.evaluate(()=>window.__entranceEvents)).length,2);reports.interactions.clientNavigation={routes:tour.length,entranceReplays:0};
   await entrance.reload({waitUntil:'networkidle0'});await wait(1700);assert.equal((await entrance.evaluate(()=>window.__entranceEvents)).length,0);
  }
  reports.entrance.push({scenario,events,removed:true});await context.close();
 }
 assert.equal(reports.errors.length,0,JSON.stringify(reports.errors));
 console.log('All production assertions passed');
 } finally {fs.writeFileSync('reports/production-checks.json',JSON.stringify(reports,null,2));await browser.close();}
}
main().catch(error=>{console.error(error);process.exit(1)});
