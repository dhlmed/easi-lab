import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const read=name=>JSON.parse(fs.readFileSync('dist/assets/'+name+'.json','utf8'));
const content=read('site-content'),publications=read('publications'),slides=read('research-slides');
const source=fs.readFileSync('dist/assets/app.js','utf8');
const origin=content.origin;
const basePath=content.basePath||'';
const localPath=value=>{assert(value.startsWith(basePath+'/'),`URL outside site path: ${value}`);return value.slice(basePath.length)};
const decode=s=>s.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'").replaceAll('&lt;','<').replaceAll('&gt;','>');
const sitemap=fs.readFileSync('dist/sitemap.xml','utf8');
const canonicals=new Set();
const descriptions=new Set();
for(const [key,m] of Object.entries(content.pages))for(const lang of ['ko','en']){
 const pathname=basePath+'/'+(lang==='en'?'en/':'')+m.file;
 const base=origin+pathname;
 const html=fs.readFileSync('dist'+localPath(pathname),'utf8');
 assert(html.includes(`<html lang="${lang}">`));
 assert(!html.includes('noindex'));
 assert(html.includes(`<link rel="canonical" href="${base}">`));
 canonicals.add(base);
 assert(sitemap.includes('<loc>'+base+'</loc>'));
 for(const variant of ['ko','en'])assert(html.includes(`<link rel="alternate" hreflang="${variant}" href="${origin}${basePath}/${variant==='en'?'en/':''}${m.file}">`));
 const description=decode(html.match(/<meta name="description" content="([^"]*)"/)[1]);
 assert.equal(description,m.description[lang==='en'?1:0]);descriptions.add(description);
 assert.equal(decode(html.match(/<meta property="og:description" content="([^"]*)"/)[1]),description);
 for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  const u=new URL(decode(match[1]),base);if(u.origin!==origin)continue;
  assert(fs.existsSync('dist'+localPath(u.pathname)),`${pathname}: missing ${u.pathname}`);
  if(u.hash&&u.pathname.endsWith('.html'))assert(fs.readFileSync('dist'+localPath(u.pathname),'utf8').includes(`id="${decodeURIComponent(u.hash.slice(1))}"`),`${pathname}: missing anchor ${u.href}`);
 }
 const scripts=[...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
 assert.equal(scripts.length,2);assert.equal(scripts[1].url,base);assert.equal(scripts[1].inLanguage,lang);
 if(key==='pi'){assert.equal(scripts[1]['@type'],'ProfilePage');assert(html.includes('Councilor')||html.includes('평의원'));assert(!html.includes('Secretary General'));}
 if(key==='collaborate'){assert.equal((html.match(/class="opportunity"/g)||[]).length,4);assert(html.includes('inquiry=industry-collaboration'));assert(!html.includes('<form'));}
 if(key==='research'){
  for(const [area,project] of [['aging','aging'],['neuro','skin-brain'],['immunity','inflammation'],['devices','devices']]){
   const actions=html.match(new RegExp(`<div class="actions research-actions" data-research-actions="${area}">([\\s\\S]*?)<\\/div>`))?.[1];
   assert(actions,`${lang}: missing research actions for ${area}`);
   const links=[...actions.matchAll(/href="([^"]+)"/g)].map(m=>new URL(decode(m[1]),base));
   assert.equal(links.length,2);
   assert.equal(links[0].pathname,`${basePath}/${lang==='en'?'en/':''}join.html`);
   assert.equal(links[0].searchParams.get('inquiry'),'academic-collaboration');
   assert.equal(links[0].searchParams.get('project'),project);
   assert.equal(links[0].hash,'#contact');
   assert.equal(links[1].pathname,`${basePath}/${lang==='en'?'en/':''}publications.html`);
   assert.equal(links[1].searchParams.get('topic'),area);
  }
 }
 if(key==='stories')assert.equal((html.match(/class="story-card"/g)||[]).length,3);
 if(key==='methods'){assert(html.includes('pySCENIC'));assert(html.includes('Energy')||html.includes('energy')||html.includes('EBD'));}
 if(key.startsWith('story-')){const s=content.stories.find(s=>s.key===key);assert(html.includes(s.doi));assert(html.includes(lang==='en'?'Interpreting the evidence':'어디까지 해석할 수 있나요?'));for(const id of s.figureIds){const f=slides.find(x=>x.id===id);assert(html.includes(f.licenseUrl)&&html.includes(f.file)&&html.includes(f.panel));}}
 assert(!html.includes('publications.txt'));assert(!/data-share|navigator.share/.test(html));
}
assert.equal(canonicals.size,30);assert.equal(descriptions.size,30);
assert.equal((sitemap.match(/<loc>/g)||[]).length,30);
assert(fs.readFileSync('dist/robots.txt','utf8').includes('Allow: /'));
for(const lang of ['ko','en']){
 const prefix=basePath+(lang==='en'?'/en/':'/');
 const oldRoute=prefix+'story-multimodal-imaging-ai.html';
 const retired=fs.readFileSync('dist'+localPath(oldRoute),'utf8');
 assert(retired.includes('noindex,follow')&&retired.includes('0;url='+prefix+'methods.html#digital-imaging'));
 assert(!sitemap.includes(oldRoute));
}
assert(!content.stories.some(s=>s.publicationId===155));
// Exercise actual browser entry and language-switch callback with URL and metadata state.
function runtime(pathname,search='',language='ko',page='home'){
 const location=new URL(origin+basePath+pathname+search+'#main');
 const meta=new Map();const handlers={};
 const languages=['ko','en'].map(lang=>({dataset:{lang},addEventListener:(event,fn)=>handlers[lang]=fn}));
 const elements=new Map();
 const el=()=>({innerHTML:'',setAttribute(key,value){this[key]=value},addEventListener(){},classList:{remove(){},toggle(){}}});
 const document={title:'',documentElement:{lang:language},body:{dataset:{page}},addEventListener(){},querySelectorAll:sel=>sel==='[data-lang]'?languages:[],getElementById(id){if(id==='inquiry-form')return null;if(!elements.has(id))elements.set(id,el());return elements.get(id)},querySelector(sel){if(sel.startsWith('meta[')||sel.startsWith('link[')){if(!meta.has(sel))meta.set(sel,el());return meta.get(sel)}if(sel==='#page-structured-data')return {textContent:'{"@type":"WebPage"}'};return null}};
 const context={window:{LAB_SITE_CONTENT:content,LAB_PUBLICATIONS:publications,LAB_RESEARCH_SLIDES:slides},document,location,URL,URLSearchParams,history:{replaceState(a,b,u){location.href=String(u)}}};
 vm.createContext(context);vm.runInContext(source,context);
 return {context,handlers,meta,elements};
}
const legacy=runtime('/research.html','?lang=en&q=HDAC4','ko','research');
assert.equal(legacy.context.location.pathname,basePath+'/en/research.html');assert.equal(legacy.context.location.search,'?q=HDAC4');assert.equal(legacy.context.document.documentElement.lang,'en');
assert(legacy.context.document.title.startsWith('Research |'));
legacy.handlers.ko({preventDefault(){}});
assert.equal(legacy.context.location.pathname,basePath+'/research.html');assert.equal(legacy.context.location.search,'?q=HDAC4');assert.equal(legacy.context.location.hash,'#main');
assert.equal(legacy.meta.get('link[rel="canonical"]').href,origin+basePath+'/research.html');
assert(legacy.context.document.title.startsWith('연구 분야 |'));
const directEnglish=runtime('/en/research-stories.html','','en','stories');assert(directEnglish.context.document.title.startsWith('Research Stories |'));
const collabContext={window:{LAB_SITE_CONTENT:content,LAB_PUBLICATIONS:publications,LAB_RESEARCH_SLIDES:slides,__BUILD:true},document:{body:{dataset:{page:'join'}},documentElement:{lang:'en'}},location:{search:'?inquiry=industry-collaboration&project=devices'},URL,URLSearchParams};
vm.createContext(collabContext);vm.runInContext(source,collabContext);const draftPage=collabContext.window.LAB.renderPage();assert(draftPage.includes('value="industry-collaboration" selected'));assert(draftPage.includes('Topic: Measuring responses to devices and EBD'));
for(const lang of ['ko','en'])for(const project of ['aging','skin-brain','inflammation','devices']){
 const ctx={window:{LAB_SITE_CONTENT:content,LAB_PUBLICATIONS:publications,LAB_RESEARCH_SLIDES:slides,__BUILD:true},document:{body:{dataset:{page:'join'}},documentElement:{lang}},location:{search:`?inquiry=academic-collaboration&project=${project}`},URL,URLSearchParams};
 vm.createContext(ctx);vm.runInContext(source,ctx);
 const html=ctx.window.LAB.renderPage();
 assert(html.includes('value="academic-collaboration" selected'));
 assert(html.includes(content.opportunities.find(x=>x.key===project).title[lang==='en'?1:0]));
}
console.log('PASS: 30 crawlable static language documents, metadata, reciprocal alternates, structured data, sitemap, all URL/fragment/asset targets, legacy language migration, language-switch URL and metadata state, evidence links and collaborator topic prefill.');
